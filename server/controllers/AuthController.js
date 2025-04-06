import { compare } from 'bcrypt';
import User from '../models/UserModel.js';
import jwt from 'jsonwebtoken';
import { response } from 'express';
import {renameSync, unlinkSync}  from 'fs';
const maxage = 3 * 24 * 60 * 60 * 1000;

const createToken = (email, userId) => {
    return jwt.sign({ email, userId }, process.env.JWT_KEY, { expiresIn: maxage, });
}

export const signup = async (request, response, next) => {
    try {
        const { email, password } = request.body;
        if (!email || !password) {
            return response.status(400).send("Email and password are required.");
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return response.status(400).send("User with this email already exists.");
        }

        // Hash the password before saving
        //const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({ email, password });

        response.cookie("jwt", createToken(email, user.id), {
            maxage,
            secure: true,
            sameSite: "None",
        });

        return response.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                // Add any other user fields you need
                profileSetup: user.profileSetup
            }
        });
    } catch (error) {
        console.error(error);
        return response.status(500).send("Internal server error.");
    }
}

export const login = async (request, response, next) => {
    try {
        const { email, password } = request.body;
        if (!email || !password) {
            return response.status(400).send("Email and password are required.");
        }

        const user = await User.findOne({ email });
        if (!user) {
            return response.status(404).send("User with the given email not found.");
        }

        const auth = await compare(password, user.password);
        if (!auth) {
            return response.status(401).send("Password is incorrect.");
        }

        response.cookie("jwt", createToken(email, user.id), {
            maxage,
            secure: true,
            sameSite: "None",
        });

        return response.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                image: user.image,
                color: user.color,
                profileSetup: user.profileSetup
            }
        });
    } catch (error) {
        console.error(error);
        return response.status(500).send("Internal server error.");
    }
}

export const getUserInfo = async (request, response, next) =>{
try {
    const userData = await User.findById(request.userId);
   console.log(request.userId);
   if(!userData){
    return response.status(404).send("user with the given mail not found");
   }
    return response.status(200).json({
     
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
            profileSetup: userData.profileSetup
        
   });
} catch (error) {
    console.error(error);
    return response.status(500).send("Internal server error.");
}
}
export const updateProfile = async (request, response, next) =>{
try {
    const {userId} = request;
    const {firstName, lastName, color } = request.body;
    if(!firstName || !lastName ){
        return response.status(400).send("first name, last name, color are all required");
    }
    const userData = await User.findByIdAndUpdate(userId, {firstName, lastName, color, profileSetup: true}, {new:true, runValidators:true});
    return response.status(200).json({
     
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            image: userData.image,
            color: userData.color,
            profileSetup: userData.profileSetup
        
   });
} catch (error) {
    console.error(error);
    return response.status(500).send("Internal server error.");
}
};
export const addProfileImage = async (request, response, next) =>{
    
    console.log("File received:", request.file);
    console.log("Request body:", request.body);
    try {
          if(!request.file){
            return response.status(400).send("file is required");
          }
         const date = Date.now();
         let fileName = "uploads/profiles/" +date  + request.file.originalname;
         renameSync(request.file.path, fileName);
         const updatedUser  = await User.findByIdAndUpdate(request.userId, 
            {image:fileName},
             {new:true, runValidators: true});
        return response.status(200).json({
                image: updatedUser.image,     
       });
    } catch (error) {
        console.error(error);
        return response.status(500).send("Internal server error.");
    }
    }

export const removeProfileImage = async( request, response, next) =>{
    try{
        const {userId} = request;
        const user = await User.findById(userId);
        if(!user){
            return response.status(404).send("user not found");
        }
        if(user.image){
            unlinkSync(user.image)
        }
        user.image= null;
        await user.save();

     return response.status(200).send("profile image removed successfully");

    } catch(error){
        console.log("error --" ,error);

    }
};

export const logout = async( request, response, next) =>{
    try{
    
     response.cookie("jwt", "", {maxAge: 1, secure:true, sameSite: "None"})
     return response.status(200).send("logout successfull");

    } catch(error){
        console.log(error);
        return response.status(500).send("internal server error");
    }
};

