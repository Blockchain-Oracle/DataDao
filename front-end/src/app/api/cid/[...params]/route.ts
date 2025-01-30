import { gql, GraphQLClient } from "graphql-request";
import { NextRequest, NextResponse } from "next/server";
import { inflate } from "pako";
import { TaskMetadata } from "@/types/task";

const detectFileType = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  const bytes = [...new Uint8Array(arrayBuffer.slice(0, 4))]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  const magicNumbers = {
    "89504E47": "image/png",
    FFD8FFE0: "image/jpeg",
    FFD8FFE1: "image/jpeg",
    FFD8FFE2: "image/jpeg",
    FFD8FFE3: "image/jpeg",
    FFD8FFE8: "image/jpeg",
    FFD8FFDB: "image/jpeg",
    FFD8FFEE: "image/jpeg",
    "47494638": "image/gif",
    "3C3F786D": "image/svg+xml",
    "3C737667": "image/svg+xml",
    "424D": "image/bmp",
  };

  for (const [signature, type] of Object.entries(magicNumbers)) {
    if (bytes.startsWith(signature)) {
      return type;
    }
  }

  return "unknown";
};

async function fetchFromAutoDrive(cid: string) {
  const endpoint = `https://subql.blue.taurus.subspace.network/v1/graphql`;
  const client = new GraphQLClient(endpoint);
  const query = gql`
    query GetCID($cid: String!) {
      files_files(where: { id: { _eq: $cid } }) {
        chunk {
          data
          uploadOptions: upload_options
        }
        file_cids {
          chunk {
            data
          }
        }
      }
    }
  `;

  const data = await client.request(query, { cid });
  console.log(data, "data....................................");
  console.log(cid);
  if (!data.files_files.length) {
    throw new Error("CID not found");
  }

  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processRawData(data: any): Promise<ArrayBuffer> {
  let dataArrayBuffer = new ArrayBuffer(0);
  const fileData = data.files_files[0];
  if (fileData.file_cids.length === 0) {
    const rawData = fileData.chunk.data;
    dataArrayBuffer = Object.values(
      JSON.parse(rawData)
    ) as unknown as ArrayBuffer;
  } else {
    for (const fileCid of fileData.file_cids) {
      const chunkData = Object.values(
        JSON.parse(fileCid.chunk.data)
      ) as unknown as ArrayBuffer;
      dataArrayBuffer = new Uint8Array([
        ...new Uint8Array(dataArrayBuffer),
        ...new Uint8Array(chunkData),
      ]).buffer;
    }
  }

  // Handle compression
  try {
    const uploadOptions = fileData.chunk.uploadOptions
      ? JSON.parse(fileData.chunk.uploadOptions)
      : null;

    if (uploadOptions?.compression?.algorithm === "ZLIB") {
      dataArrayBuffer = inflate(Buffer.from(dataArrayBuffer))
        .buffer as ArrayBuffer;
    }
  } catch (error) {
    console.error("Error decompressing data:", error);
  }

  return dataArrayBuffer;
}

async function processMetadata(cid: string): Promise<NextResponse> {
  const data = await fetchFromAutoDrive(cid);
  const dataArrayBuffer = await processRawData(data);

  try {
    const jsonString = Buffer.from(dataArrayBuffer).toString("utf-8");
    console.log(jsonString, "jsonString(((((   ))))))))))");
    const metadata = JSON.parse(jsonString.trim()) as TaskMetadata;

    // Process image URLs in metadata
    if (metadata.images) {
      metadata.images = metadata.images.map((img) => ({
        ...img,
        url: `/api/cid/image/${img.cid}`,
      }));
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Error processing metadata:", error);
    return NextResponse.json(
      { error: "Invalid metadata format" },
      { status: 400 }
    );
  }
}

async function processImage(cid: string): Promise<NextResponse> {
  const data = await fetchFromAutoDrive(cid);
  const dataArrayBuffer = await processRawData(data);

  const fileType = await detectFileType(dataArrayBuffer);

  if (!fileType.startsWith("image/")) {
    return NextResponse.json(
      { error: "Invalid image format" },
      { status: 400 }
    );
  }

  return new NextResponse(dataArrayBuffer, {
    status: 200,
    headers: {
      "Content-Type": fileType,
    },
  });
}

export async function GET(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;
    const segments = pathname.split("/").slice(3);
    const type = segments[0]; // 'metadata' or 'image'
    const cid = segments[1];

    if (!cid) {
      return NextResponse.json({ error: "CID is required" }, { status: 400 });
    }

    if (type === "metadata") {
      return await processMetadata(cid);
    } else if (type === "image") {
      return await processImage(cid);
    } else {
      return NextResponse.json(
        { error: "Invalid type - must be 'metadata' or 'image'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
