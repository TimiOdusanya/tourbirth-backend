import { DestinationModel, IDestination } from "../../shared/models/destination.model";

export class DestinationService {
  // Create a new destination
  static async createDestination(city: string, country: string): Promise<IDestination> {
    // Check if destination already exists
    const existingDestination = await DestinationModel.findOne({ 
      city: city.toLowerCase(), 
      country: country.toLowerCase() 
    });

    if (existingDestination) {
      throw new Error("Destination already exists");
    }

    const destination = new DestinationModel({
      city: city.toLowerCase(),
      country: country.toLowerCase()
    });

    return await destination.save();
  }

  // Get all active destinations
  static async getAllDestinations(): Promise<IDestination[]> {
    return await DestinationModel.find({ isActive: true })
      .sort({ city: 1, country: 1 });
  }

  // Get destination by ID
  static async getDestinationById(id: string): Promise<IDestination | null> {
    return await DestinationModel.findById(id);
  }

  // Update destination
  static async updateDestination(id: string, updateData: Partial<IDestination>): Promise<IDestination> {
    const destination = await DestinationModel.findById(id);
    if (!destination) {
      throw new Error("Destination not found");
    }

    // Check if new city/country combination already exists
    if (updateData.city || updateData.country) {
      const existingDestination = await DestinationModel.findOne({
        city: updateData.city?.toLowerCase() || destination.city,
        country: updateData.country?.toLowerCase() || destination.country,
        _id: { $ne: id }
      });

      if (existingDestination) {
        throw new Error("Destination with this city and country combination already exists");
      }
    }

    if (updateData.city) destination.city = updateData.city.toLowerCase();
    if (updateData.country) destination.country = updateData.country.toLowerCase();

    return await destination.save();
  }

  // Delete destination (soft delete)
  static async deleteDestination(id: string): Promise<void> {
    const destination = await DestinationModel.findById(id);
    if (!destination) {
      throw new Error("Destination not found");
    }

    destination.isActive = false;
    await destination.save();
  }
} 