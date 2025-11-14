// Utility functions for handling profile picture operations

export interface ProfilePictureData {
  name?: string;
  size?: number;
  type?: string;
  link?: string;
}

/**
 * Validates profile picture data
 */
export const validateProfilePicture = (data: any): ProfilePictureData | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Check if it has the required structure
  if (data.name && data.size && data.type && data.link) {
    return {
      name: data.name,
      size: Number(data.size),
      type: data.type,
      link: data.link
    };
  }

  return null;
};

/**
 * Updates profile picture for a user/admin account
 */
export const updateProfilePicture = async (
  model: any, 
  userId: string, 
  profilePictureData: ProfilePictureData
) => {
  const validatedData = validateProfilePicture(profilePictureData);
  
  if (!validatedData) {
    throw new Error('Invalid profile picture data');
  }

  const result = await model.findByIdAndUpdate(
    userId,
    { profilePicture: validatedData },
    { new: true }
  );

  if (!result) {
    throw new Error('User not found');
  }

  return result;
}; 