
export interface PincodeDetails {
  Message: string;
  Status: string;
  PostOffice: {
    Name: string;
    Description: string | null;
    BranchType: string;
    DeliveryStatus: string;
    Circle: string;
    District: string;
    Division: string;
    Region: string;
    Block: string;
    State: string;
    Country: string;
    Pincode: string;
  }[] | null;
}

export async function fetchPincodeDetails(pincode: string): Promise<PincodeDetails | null> {
  if (!pincode || pincode.length !== 6) return null;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const data = await response.json();
    
    if (data && data[0] && data[0].Status === "Success") {
      return data[0];
    }
    return null;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      console.warn("Pincode API fetch timed out");
    } else {
      console.error("Error fetching pincode details:", error);
    }
    return null;
  }
}
