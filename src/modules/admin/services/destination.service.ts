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

  // Get all destinations with pagination and search
  static async getAllDestinationsPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{
    destinations: IDestination[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    const skip = (page - 1) * limit;
    
    // Build search query
    let searchQuery: any = { isActive: true };
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      searchQuery = {
        isActive: true,
        $or: [
          { city: searchRegex },
          { country: searchRegex }
        ]
      };
    }

    // Get total count for pagination
    const totalItems = await DestinationModel.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / limit);

    // Get destinations with pagination
    const destinations = await DestinationModel.find(searchQuery)
      .sort({ city: 1, country: 1 })
      .skip(skip)
      .limit(limit);

    return {
      destinations,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
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

  // Create multiple destinations
  static async createMultipleDestinations(destinations: Array<{ city: string; country: string }>): Promise<{ created: IDestination[]; errors: string[] }> {
    const created: IDestination[] = [];
    const errors: string[] = [];

    for (const dest of destinations) {
      try {
        // Check if destination already exists
        const existingDestination = await DestinationModel.findOne({ 
          city: dest.city.toLowerCase(), 
          country: dest.country.toLowerCase() 
        });

        if (existingDestination) {
          errors.push(`Destination ${dest.city}, ${dest.country} already exists`);
          continue;
        }

        const destination = new DestinationModel({
          city: dest.city.toLowerCase(),
          country: dest.country.toLowerCase()
        });

        const savedDestination = await destination.save();
        created.push(savedDestination);
      } catch (error: any) {
        errors.push(`Failed to create ${dest.city}, ${dest.country}: ${error.message}`);
      }
    }

    return { created, errors };
  }

  // Delete multiple destinations (soft delete)
  static async deleteMultipleDestinations(ids: string[]): Promise<{ deleted: number; errors: string[] }> {
    const errors: string[] = [];
    let deleted = 0;

    for (const id of ids) {
      try {
        const destination = await DestinationModel.findById(id);
        if (!destination) {
          errors.push(`Destination with ID ${id} not found`);
          continue;
        }

        destination.isActive = false;
        await destination.save();
        deleted++;
      } catch (error: any) {
        errors.push(`Failed to delete destination with ID ${id}: ${error.message}`);
      }
    }

    return { deleted, errors };
  }
} 