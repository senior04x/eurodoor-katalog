// ImgBB API uchun rasm yuklash funksiyasi (CORS qo'llab-quvvatlaydi)
export interface ImageUploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadImageToImgBB = async (file: File): Promise<ImageUploadResponse> => {
  try {
    // File formatini tekshirish
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Faqat JPG, PNG va WebP formatlaridagi rasmlar qabul qilinadi'
      };
    }

    // File hajmini tekshirish (32MB dan kichik - ImgBB limiti)
    const maxSize = 32 * 1024 * 1024; // 32MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'Rasm hajmi 32MB dan kichik bo\'lishi kerak'
      };
    }

    // File ni base64 ga aylantirish
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // data:image/jpeg;base64, qismini olib tashlash
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    // ImgBB API ga so'rov yuborish
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        key: '15ccd1b7ef91f19fe2f3c4d2600ab9ee', // ImgBB API key
        image: base64,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // ImgBB API response formatini tekshirish
    if (data.success && data.data && data.data.url) {
      return {
        success: true,
        url: data.data.url
      };
    } else {
      return {
        success: false,
        error: data.error?.message || 'Rasm yuklanmadi'
      };
    }

  } catch (error) {
    console.error('Image upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Rasm yuklashda xatolik yuz berdi'
    };
  }
};

// Rasm URL ni tekshirish funksiyasi
export const validateImageUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

// Rasm hajmini formatlash funksiyasi
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
