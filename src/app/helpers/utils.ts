export const isValidContractAddress = (address : string) => {
    if ( address.startsWith("ct_") || address.endsWith(".chain")) {
      return true
    } else {
      return false
    }
  }
  
