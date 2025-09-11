export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = async () => {
      try {
        const base64 = reader.result as string
        const base64Data = base64.split(',')[1]
        
        const formData = new FormData()
        formData.append('image', base64Data)
        
        const response = await fetch('https://api.imgbb.com/1/upload?key=4a8b9c2d3e5f6a7b8c9d0e1f2a3b4c5d', {
          method: 'POST',
          body: formData
        })
        
        const data = await response.json()
        
        if (data.success) {
          resolve(data.data.url)
        } else {
          reject(new Error('Image upload failed'))
        }
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('File reading failed'))
    reader.readAsDataURL(file)
  })
}