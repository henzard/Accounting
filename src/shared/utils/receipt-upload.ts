// Receipt Upload Utility
// Handles uploading receipt photos to Firebase Storage

import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/infrastructure/firebase';
import { auth } from '@/infrastructure/firebase';
import { Platform } from 'react-native';

export interface ReceiptImage {
  uri: string;
  type?: string;
  name?: string;
}

/**
 * Request camera and media library permissions
 */
export async function requestImagePermissions(): Promise<boolean> {
  try {
    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (!cameraPermission.granted) {
      console.warn('⚠️ Camera permission not granted');
    }

    // Request media library permissions
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!mediaPermission.granted) {
      console.warn('⚠️ Media library permission not granted');
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error requesting image permissions:', error);
    return false;
  }
}

/**
 * Pick an image from the device (camera or gallery)
 */
export async function pickReceiptImage(): Promise<ReceiptImage | null> {
  try {
    // Request permissions first
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) {
      return null;
    }

    // Show action sheet to choose camera or gallery
    // For now, we'll use gallery by default (can be enhanced later)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8, // Compress to 80% quality for storage efficiency
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    if (!asset) {
      return null;
    }

    return {
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: asset.fileName || `receipt_${Date.now()}.jpg`,
    };
  } catch (error) {
    console.error('❌ Error picking image:', error);
    return null;
  }
}

/**
 * Take a photo with the camera
 */
export async function takeReceiptPhoto(): Promise<ReceiptImage | null> {
  try {
    // Request permissions first
    const hasPermission = await requestImagePermissions();
    if (!hasPermission) {
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (result.canceled) {
      return null;
    }

    const asset = result.assets[0];
    if (!asset) {
      return null;
    }

    return {
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: asset.fileName || `receipt_${Date.now()}.jpg`,
    };
  } catch (error) {
    console.error('❌ Error taking photo:', error);
    return null;
  }
}

/**
 * Sanitize filename for Firebase Storage (remove special characters)
 */
function sanitizeFileName(fileName: string): string {
  // Remove or replace special characters that might cause issues
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 255); // Limit length
}

/**
 * Convert image URI to Blob/File for upload
 */
async function imageUriToBlob(uri: string, mimeType: string): Promise<Blob> {
  if (Platform.OS === 'web') {
    // On web, if it's already a blob URL or data URL, use it directly
    if (uri.startsWith('blob:') || uri.startsWith('data:')) {
      const response = await fetch(uri);
      return await response.blob();
    }
    
    // For file:// URLs on web, we need to use FileReader or fetch
    // If it's a file input, it should already be a File object
    // For now, try fetch which works for most cases
    try {
      const response = await fetch(uri);
      return await response.blob();
    } catch (error) {
      console.error('❌ Error converting URI to blob on web:', error);
      throw new Error('Failed to convert image for upload. Please try selecting the image again.');
    }
  } else {
    // On native, fetch works fine
    const response = await fetch(uri);
    return await response.blob();
  }
}

/**
 * Upload receipt image to Firebase Storage
 * @param image The receipt image to upload
 * @param transactionId The transaction ID
 * @param householdId The household ID
 * @returns The download URL of the uploaded image
 */
export async function uploadReceiptToStorage(
  image: ReceiptImage,
  transactionId: string,
  householdId: string
): Promise<string> {
  try {
    // Verify user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to upload receipts');
    }

    // Convert image URI to blob
    const blob = await imageUriToBlob(image.uri, image.type || 'image/jpeg');

    // Create storage path: receipts/{householdId}/{transactionId}/{timestamp}_{filename}
    const timestamp = Date.now();
    const originalFileName = image.name || `receipt_${timestamp}.jpg`;
    const sanitizedFileName = sanitizeFileName(originalFileName);
    const storagePath = `receipts/${householdId}/${transactionId}/${timestamp}_${sanitizedFileName}`;
    const storageRef = ref(storage, storagePath);

    // Upload to Firebase Storage
    console.log(`📤 Uploading receipt to: ${storagePath}`);
    console.log(`📤 Blob size: ${blob.size} bytes, type: ${blob.type}`);
    
    await uploadBytes(storageRef, blob, {
      contentType: image.type || 'image/jpeg',
    });

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log(`✅ Receipt uploaded successfully: ${downloadURL}`);

    return downloadURL;
  } catch (error: any) {
    console.error('❌ Error uploading receipt:', error);
    
    // Provide more helpful error messages
    if (error?.code === 'storage/unauthorized') {
      throw new Error('You do not have permission to upload receipts. Please check Firebase Storage security rules.');
    } else if (error?.code === 'storage/canceled') {
      throw new Error('Upload was canceled.');
    } else if (error?.message?.includes('CORS')) {
      throw new Error('CORS error: Please check Firebase Storage CORS configuration and security rules.');
    } else {
      throw new Error(`Failed to upload receipt photo: ${error?.message || 'Unknown error'}`);
    }
  }
}

/**
 * Upload multiple receipt images
 */
export async function uploadReceipts(
  images: ReceiptImage[],
  transactionId: string,
  householdId: string
): Promise<string[]> {
  const uploadPromises = images.map((image) =>
    uploadReceiptToStorage(image, transactionId, householdId)
  );

  try {
    const urls = await Promise.all(uploadPromises);
    console.log(`✅ Uploaded ${urls.length} receipt(s)`);
    return urls;
  } catch (error) {
    console.error('❌ Error uploading receipts:', error);
    throw error;
  }
}

/**
 * Delete a receipt image from Firebase Storage by its download URL
 * @param downloadURL The download URL of the image to delete
 */
export async function deleteReceiptFromStorage(downloadURL: string): Promise<void> {
  try {
    // Verify user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User must be authenticated to delete receipts');
    }

    // Extract the storage path from the download URL
    // URL format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
    const urlObj = new URL(downloadURL);
    const pathMatch = urlObj.pathname.match(/\/o\/(.+)\?/);
    
    if (!pathMatch || !pathMatch[1]) {
      throw new Error('Invalid receipt URL format');
    }

    // Decode the path (it's URL encoded)
    const storagePath = decodeURIComponent(pathMatch[1]);
    const storageRef = ref(storage, storagePath);

    console.log(`🗑️ Deleting receipt from: ${storagePath}`);
    
    await deleteObject(storageRef);
    
    console.log(`✅ Receipt deleted successfully: ${storagePath}`);
  } catch (error: any) {
    console.error('❌ Error deleting receipt:', error);
    
    // Provide more helpful error messages
    if (error?.code === 'storage/object-not-found') {
      console.warn('⚠️ Receipt already deleted or not found');
      // Don't throw - it's okay if it's already gone
      return;
    } else if (error?.code === 'storage/unauthorized') {
      throw new Error('You do not have permission to delete receipts. Please check Firebase Storage security rules.');
    } else {
      throw new Error(`Failed to delete receipt photo: ${error?.message || 'Unknown error'}`);
    }
  }
}

/**
 * Delete multiple receipt images from Firebase Storage
 * @param downloadURLs Array of download URLs to delete
 */
export async function deleteReceipts(downloadURLs: string[]): Promise<void> {
  if (downloadURLs.length === 0) {
    return;
  }

  const deletePromises = downloadURLs.map((url) => deleteReceiptFromStorage(url));

  try {
    await Promise.allSettled(deletePromises);
    console.log(`✅ Deleted ${downloadURLs.length} receipt(s)`);
  } catch (error) {
    console.error('❌ Error deleting receipts:', error);
    // Don't throw - we want to continue even if some deletions fail
  }
}
