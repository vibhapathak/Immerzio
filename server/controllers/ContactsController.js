//import User from "@/models/UserModel.js";
import User from '../models/UserModel.js';
export const searchContacts = async (request, response, next) => {
    try {
        const { searchTerm } = request.body;

        if (!searchTerm) { // Simplified null/undefined check
            return response.status(400).json({ error: "Search term is required" });
        }

        const sanitizedSearchTerm = searchTerm.replace(
            /[,*+/64{}()| [\]\\]/g,
            "\\$&"
        );

        const regex = new RegExp(sanitizedSearchTerm, "i");
        const contacts = await User.find({
            $and: [
                { _id: { $ne: request.userId } },
                { $or: [{ firstName: regex }, { lastName: regex }, { email: regex }] }
            ]
        });

        return response.status(200).json({ contacts });

    } catch (error) {
        console.error(error); // Use console.error for errors
        return response.status(500).json({ error: "Internal server error" });
    }
};
