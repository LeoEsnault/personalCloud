import { defineStore } from "pinia";
import axios from "axios";

export const useDiskStore = defineStore('disk', () => {

    async function fetchDiskUtile() {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACK_URL}/disk/getDisk`,{
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch disk utilization');
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching disk utilization:', error);
            throw error;
        }
    }

    async function getFiles(diskPath) {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACK_URL}/disk/getFiles`, {
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
             params: {diskPath}
            });
            if (response.status !== 200) {
                throw new Error('Failed to fetch files');
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching files:', error);
            throw error;
        }
    }

    async function getFileContenu(diskPath, filePath){

            try {
            const response = await axios.get(`${import.meta.env.VITE_BACK_URL}/disk/getFileContenu`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
             params: {diskPath, filePath}
            });
            if (response.status !== 200) {
                throw new Error('Failed to fetch files');
            }
            return response.data;
        } catch (error) {
            console.error('Error fetching files:', error);
            throw error;
        }

    }

    async function getMediaFile(diskPath, filePath) {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACK_URL}/disk/streamFile`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                params: { diskPath, filePath },
                responseType: 'blob' 
            });

            return response.data;
        } catch (error) {
            console.error('Erreur lors du téléchargement du média:', error);
            throw error;
        }
    }

    async function downloadFolderAsZip(selectionedDisk, filePath){
         if (!filePath.startsWith('/')) {
                filePath = '/' + filePath;
            }
        if(!selectionedDisk || !filePath){
            console.error('Erreur dans le chemin disk et file')
            throw new Error('Erreur dans le chemin disk et file')
        }

        try{
            const response = await axios.get(`${import.meta.env.VITE_BACK_URL}/disk/downloadFolderAsZip`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                params: {
                    diskPath: selectionedDisk,
                    folderPath: filePath
                },
                responseType: 'blob'
        })
        return response.data;
        }
        catch(error){
                if (error.response && error.response.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => console.error("Erreur Backend détaillée:", JSON.parse(reader.result));
        reader.readAsText(error.response.data);
        }

            console.error('Erreur dans la récupération du fichier')
            throw new Error('Erreur dans la récupération du fichier')
        }

    }

async function uploadFiles(selectionedDisk, currentPath, formData) {

  if (!currentPath.startsWith('/')) {
    currentPath = '/' + currentPath;
  }

  if (!selectionedDisk || !currentPath || !formData) {
    console.error('Erreur dans la récupération du fichier');
    throw new Error('Pas de chemin de disque');
  }
  try {
   
    const response = await axios.post(`${import.meta.env.VITE_BACK_URL}/disk/uploadFiles`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data',
      },
      params: {
        diskPath: selectionedDisk,
        filePath: currentPath,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur dans l\'envoi du fichier');
    throw new Error('Erreur dans l\'envoi du fichier');
  }
}

    return { fetchDiskUtile, getFiles, getFileContenu, getMediaFile, downloadFolderAsZip, uploadFiles  };

})
