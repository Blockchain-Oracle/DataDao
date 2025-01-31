import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { level: string; tokenId: string } }
) {
  try {
    const { level, tokenId } = params;
    const { searchParams } = new URL(request.url);
    console.log(searchParams);
    const numericLevel = searchParams.get('level');
    const tasks = searchParams.get('tasks');
    const quality = searchParams.get('quality'); 
    const highscore = searchParams.get('highscore');

    // Construct metadata based on NFT level and achievements
    const metadata = {
      name: `Data DAO Performance NFT #${tokenId}`,
      description: "A dynamic NFT that evolves with user performance",
      image: `${process.env.NEXT_PUBLIC_API_URL}/api/nft/${level}/${tokenId}/image`,
      attributes: [
        {
          trait_type: "Level",
          value: numericLevel || level
        },
        {
          trait_type: "Tasks Completed", 
          value: parseInt(tasks || '0')
        },
        {
          trait_type: "Quality Score",
          value: parseFloat(quality || '0')
        },
        {
          trait_type: "High Score",
          value: parseInt(highscore || '0')
        }
      ]
    };

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Error fetching NFT metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}
