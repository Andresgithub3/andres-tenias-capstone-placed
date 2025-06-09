import { supabase } from "../api/client/supabase";

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB in bytes

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/gif",
  "text/plain",
];

const DOCUMENT_TYPES = {
  candidate: ["resume", "portfolio", "certification", "other"],
  company: ["contract", "agreement", "other"],
};

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

function validateFile(file, entityType, documentType) {
  const errors = [];

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(
      `File size exceeds 25MB limit. Current size: ${(
        file.size /
        1024 /
        1024
      ).toFixed(2)}MB`
    );
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    errors.push(
      `File type not allowed. Allowed formats: PDF, DOC, DOCX, JPG, PNG, GIF, TXT`
    );
  }

  // Check document type is valid for entity
  if (!DOCUMENT_TYPES[entityType]?.includes(documentType)) {
    errors.push(`Invalid document type '${documentType}' for ${entityType}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function generateUniqueFileName(
  userId,
  entityType,
  entityId,
  originalName
) {
  const basePath = `${userId}/${entityType}s/${entityId}`;
  const extension = originalName.split(".").pop();
  const nameWithoutExt = originalName.replace(`.${extension}`, "");

  let fileName = originalName;
  let counter = 0;

  // Check if file exists and increment counter if needed
  while (true) {
    const { data } = await supabase.storage
      .from("documents")
      .list(basePath, { search: fileName });

    if (!data || data.length === 0) {
      break; // File name is unique
    }

    counter++;
    fileName = `${nameWithoutExt}(${counter}).${extension}`;
  }

  return fileName;
}

async function checkIfFirstResume(userId, entityId) {
  try {
    console.log("Checking for existing resumes:", { userId, entityId });

    const { data, error } = await supabase
      .from("documents")
      .select("id")
      .eq("user_id", userId)
      .eq("entity_type", "candidate")
      .eq("entity_id", entityId)
      .eq("document_type", "resume");

    console.log("Resume check result:", { data, error });

    if (error) {
      console.error("Error checking resumes:", error);
      throw error;
    }

    return data.length === 0;
  } catch (error) {
    console.error("checkIfFirstResume failed:", error);
    throw error;
  }
}

// =============================================================================
// MAIN STORAGE SERVICE
// =============================================================================

export const storageService = {
  /**
   * Upload a file to storage and create database record
   * @param {File} file - The file to upload
   * @param {string} entityType - 'candidate' or 'company'
   * @param {string} entityId - ID of the entity
   * @param {string} documentType - Type of document
   * @param {function} onProgress - Progress callback (0-100)
   * @returns {Promise<object>} Upload result
   */
  async uploadFile(
    file,
    entityType,
    entityId,
    documentType,
    onProgress = () => {}
  ) {
    try {
      console.log("Starting upload:", {
        file: file.name,
        entityType,
        entityId,
        documentType,
      });

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("User not authenticated");

      console.log("User authenticated:", user.id);

      // Validate file
      const validation = validateFile(file, entityType, documentType);
      if (!validation.isValid) {
        throw new Error(validation.errors.join("\n"));
      }

      console.log("File validation passed");

      // Generate unique file name
      const fileName = await generateUniqueFileName(
        user.id,
        entityType,
        entityId,
        file.name
      );
      const filePath = `${user.id}/${entityType}s/${entityId}/${fileName}`;

      console.log("Generated file path for upload:", filePath);

      // Upload to storage with progress tracking
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            const percentage = Math.round(
              (progress.loaded / progress.total) * 100
            );
            onProgress(percentage);
          },
        });

      console.log("Storage upload result:", { uploadData, uploadError });

      if (uploadError) throw uploadError;

      // Check if this is the first resume (for auto-primary logic)
      const isFirstResume =
        documentType === "resume"
          ? await checkIfFirstResume(user.id, entityId)
          : false;

      console.log("Is first resume:", isFirstResume);

      // Create database record
      const documentRecord = {
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        document_type: documentType,
        file_name: fileName,
        file_path: filePath,
        file_size_bytes: file.size,
        mime_type: file.type,
        is_primary: isFirstResume, // Auto-primary for first resume
      };

      console.log("Creating document record:", documentRecord);

      const { data: docData, error: docError } = await supabase
        .from("documents")
        .insert(documentRecord)
        .select()
        .single();

      console.log("Database insert result:", { docData, docError });

      if (docError) {
        // If database insert fails, clean up the uploaded file
        await supabase.storage.from("documents").remove([filePath]);
        throw new Error(
          "Failed to save document record: " + JSON.stringify(docError)
        );
      }

      return {
        success: true,
        document: docData,
        isFirstResume,
        fileName,
      };
    } catch (error) {
      console.error("Upload failed:", error);
      throw new Error(error.message || "Upload failed");
    }
  },

  /**
   * Get download URL for a document
   * @param {string} filePath - Path to the file in storage
   * @param {boolean} forceDownload - Whether to force download or allow inline viewing
   * @returns {Promise<string>} Signed download URL
   */
  async getDownloadUrl(filePath, forceDownload = false) {
    try {
      const options = {
        download: forceDownload, // This controls download vs inline viewing
      };

      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(filePath, 3600, options); // 1 hour expiry

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      throw new Error("Failed to generate download URL");
    }
  },

  /**
   * Get URL for viewing (not downloading) a document
   * @param {string} filePath - Path to the file in storage
   * @returns {Promise<string>} Signed URL for viewing
   */
  async getViewUrl(filePath) {
    try {
      // trying NOT to force download
      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(filePath, 3600);

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      throw new Error("Failed to generate view URL");
    }
  },

  /**
   * Delete a document
   * @param {string} documentId - Document ID from database
   * @returns {Promise<boolean>} Success status
   */
  async deleteDocument(documentId) {
    try {
      // Get document info first
      const { data: doc, error: fetchError } = await supabase
        .from("documents")
        .select("file_path")
        .eq("id", documentId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove([doc.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

      if (dbError) throw dbError;

      return true;
    } catch (error) {
      throw new Error("Failed to delete document");
    }
  },

  /**
   * Set a document as primary
   * @param {string} documentId - Document ID
   * @param {string} entityId - Entity ID
   * @param {string} documentType - Document type
   * @returns {Promise<boolean>} Success status
   */
  async setPrimaryDocument(documentId, entityId, documentType) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // First, unset all primary documents of this type for this entity
      await supabase
        .from("documents")
        .update({ is_primary: false })
        .eq("user_id", user.id)
        .eq("entity_id", entityId)
        .eq("document_type", documentType);

      // Then set the selected document as primary
      const { error } = await supabase
        .from("documents")
        .update({ is_primary: true })
        .eq("id", documentId);

      if (error) throw error;

      return true;
    } catch (error) {
      throw new Error("Failed to set primary document");
    }
  },
};
