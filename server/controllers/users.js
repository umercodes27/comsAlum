import User from '../models/User.js';

// Read
export const getUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        res.status(200).json(user);
    }
    catch (error) {
        res.status(404).json({ message: error.message });
    }
}


export const getUserFriends = async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id);
      if (!user) {
        console.log("❌ User not found for ID:", id);
        return res.status(404).json({ message: "User not found" });
      }

      console.log("📤 Fetching friends for:", user._id, "→", user.friends);

      const friends = await Promise.all(
        user.friends.map((fid) =>
          User.findById(fid).select("_id firstName lastName occupation location picturePath")
        )
      );

      res.status(200).json(friends);
    } catch (error) {
      console.error("❌ Error in getUserFriends:", error);
      res.status(500).json({ message: error.message });
    }
  };


// Update
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendID } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendID);

    if (!user || !friend) {
      return res.status(404).json({ message: "User or friend not found." });
    }

    const userFriends = user.friends.map((fid) => fid.toString());
    const friendFriends = friend.friends.map((fid) => fid.toString());

    if (userFriends.includes(friendID)) {
      // Remove friend from both sides
      user.friends = user.friends.filter((fid) => fid.toString() !== friendID);
      friend.friends = friend.friends.filter((fid) => fid.toString() !== id);
    } else {
      // Add friend to both sides
      user.friends.push(friendID);
      friend.friends.push(id);
    }

    await user.save();
    await friend.save();

    const updatedFriends = await Promise.all(
      user.friends.map((fid) => User.findById(fid))
    );

    const formattedFriends = updatedFriends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => ({
        _id,
        firstName,
        lastName,
        occupation,
        location,
        picturePath,
      })
    );

    res.status(200).json(formattedFriends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select("_id firstName lastName");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};