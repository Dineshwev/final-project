import pako from 'pako';

export const compressData = (data) => {
  try {
    const stringData = JSON.stringify(data);
    const uint8Array = new TextEncoder().encode(stringData);
    const compressed = pako.deflate(uint8Array);
    return compressed;
  } catch (error) {
    console.error('Compression error:', error);
    return null;
  }
};

export const decompressData = (compressedData) => {
  try {
    const decompressed = pako.inflate(compressedData);
    const stringData = new TextDecoder().decode(decompressed);
    return JSON.parse(stringData);
  } catch (error) {
    console.error('Decompression error:', error);
    return null;
  }
};

export const calculateSize = (data) => {
  try {
    const stringData = JSON.stringify(data);
    const bytes = new TextEncoder().encode(stringData).length;
    return bytes;
  } catch (error) {
    console.error('Size calculation error:', error);
    return 0;
  }
};

export const calculateCompressedSize = (data) => {
  try {
    const compressed = compressData(data);
    return compressed ? compressed.length : 0;
  } catch (error) {
    console.error('Compressed size calculation error:', error);
    return 0;
  }
};

export const formatSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const shouldCompress = (sizeInBytes) => {
  // Compress if size is greater than 1MB
  return sizeInBytes > 1024 * 1024;
};