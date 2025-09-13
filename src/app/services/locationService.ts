/* eslint-disable @typescript-eslint/no-unused-vars */
import createAxiosClient from "../hooks/axiosClient"



export interface LocationHierarchy {
  provinces: string[]
  districts: { [province: string]: string[] }
  sectors: { [district: string]: string[] }
  cells: { [sector: string]: string[] }
  villages: { [cell: string]: string[] }
}

export interface LocationResponse {
  success: boolean
  data: LocationHierarchy
}




// service class
export const locationService = {

 // Updated service functions to match API documentation

fetchLocationHierarchy: async (province: string[]): Promise<LocationHierarchy> => {
  try {
    const axiosClient = createAxiosClient()
    const response = await axiosClient.get<LocationResponse>("/locations/provinces")
    return response.data.data
  } catch (error) {
    console.error("Failed to fetch location hierarchy:", error)
    // Return Rwanda's basic administrative structure as fallback
    return {
      provinces: [],
      districts: {},
      sectors: {},
      cells: {},
      villages: {}
    }
  }
},

getDistrictsByProvince: async (province: string): Promise<string[]> => {
  try {
    const axiosClient = createAxiosClient()
    // Changed from GET with query params to POST with JSON body
    const response = await axiosClient.post<{ message: string; data: string[] }>(
      "/locations/districts",
      { province: province }
    )
    return response.data.data || []
  } catch (error) {
    console.error("Failed to fetch districts:", error)
    return []
  }
},

getSectorsByDistrict: async (province: string, district: string): Promise<string[]> => {
  try {
    const axiosClient = createAxiosClient()
    // Changed to POST and added required province parameter
    const response = await axiosClient.post<{ message: string; data: string[] }>(
      "/locations/sectors",
      { 
        province: province,
        district: district 
      }
    )
    return response.data.data || []
  } catch (error) {
    console.error("Failed to fetch sectors:", error)
    return []
  }
},

getCellsBySector: async (province: string, district: string, sector: string): Promise<string[]> => {
  try {
    const axiosClient = createAxiosClient()
    // Changed to POST and added required province, district parameters

    if (!province || !district || !sector) {
      console.error("Province, district, and sector are required to fetch cells.")
      return []
    }

    const response = await axiosClient.post<{ message: string; data: string[] }>(
      "/locations/cells",
      { 
        province: province,
        district: district,
        sector: sector 
      }
    )
    return response.data.data || []
  } catch (error) {
    console.error("Failed to fetch cells:", error)
    return []
  }
},

getVillagesByCell: async (province: string, district: string, sector: string, cell: string): Promise<string[]> => {
  try {
    const axiosClient = createAxiosClient()
    // Changed to POST and added required province, district, sector parameters
    const response = await axiosClient.post<{ message: string; data: string[] }>(
      "/locations/villages",
      { 
        province: province,
        district: district,
        sector: sector,
        cell: cell 
      }
    )
    return response.data.data || []
  } catch (error) {
    console.error("Failed to fetch villages:", error)
    return []
  }
},
}
