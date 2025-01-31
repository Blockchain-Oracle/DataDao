import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { level: string; tokenId: string } }
) {
  try {
    const { level } = params;
    
    // Get image hash based on NFT level
    const imageHash = getImageHash(level);

    // Fetch actual image from CID endpoint
    const imageResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cid/image/${imageHash}`);
    
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image from CID endpoint');
    }

    const imageBuffer = await imageResponse.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });

  } catch (error) {
    console.error("Error getting NFT image:", error);
    return NextResponse.json(
      { error: "Failed to get image" },
      { status: 500 }
    );
  }
}

function getImageHash(level: string): string {
  const levelMappings: Record<string, string> = {
    'rookie': 'bafkr6id4a246tmyoc7uwm6kxnphswlkwwfskwwriaxhssyz3c3nmhon6vm',
    'intermediate': 'bafkr6ib2fy7qm2g7bul7ixpobu7gfgrfszxpfgj3uoth373c5qxrwaonbm', 
    'expert': 'bafkr6ibnaj4uyfuqds3hvap4lazrzuewodiy5647qcnp4v4adtcia3vo3q',
    'master': 'bafkr6ic2gnqsutnjpndkpcz2aciaan26qrrobzwoybqgv2znrpznjmbxfe'
  };

  return levelMappings[level] || levelMappings['rookie'];
}
