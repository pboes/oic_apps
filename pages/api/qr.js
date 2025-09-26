import QRCode from "qrcode";
import { ethers } from "ethers";

function packData(onBehalf, recipient, data) {
  // Convert the data string to bytes if it's not already
  const dataBytes = ethers.toUtf8Bytes(data);

  // Use ethers solidityPacked to replicate abi.encodePacked
  const packed = ethers.solidityPacked(
    ["address", "address", "bytes"],
    [onBehalf, recipient, dataBytes],
  );

  return packed;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { value, data, customData } = req.body;

    if (!value) {
      return res.status(400).json({ error: "Value is required" });
    }

    if (!data) {
      return res.status(400).json({ error: "App ID (data field) is required" });
    }

    // Set the required parameters
    const onBehalf = ethers.ZeroAddress; // null address
    const recipient = "0xf48554937f18885c7f15c432c596b5843648231d";
    const amount = parseInt(value);

    // Combine appId and customData if provided
    const dataField = customData ? `${data}:${customData}` : data;

    // Pack the data using the packData function
    const packedData = packData(onBehalf, recipient, dataField);

    // Create the app.metri.xyz URL
    const kitchenUrl = `https://app.metri.xyz/transfer/0x6fff09332ae273ba7095a2a949a7f4b89eb37c52/crc/${amount}?data=${packedData}`;

    const qrCodeDataURL = await QRCode.toDataURL(kitchenUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });

    res.status(200).json({
      success: true,
      qrCode: qrCodeDataURL,
      value: value,
      amount: amount,
      appId: data,
      customData: customData,
      data: dataField, // Full data field including custom data
      url: kitchenUrl,
      packedData: packedData,
    });
  } catch (error) {
    console.error("QR generation error:", error);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
}
