import * as FileSystem from 'expo-file-system';

/**
 * Utility functions for local filesystem management.
 */
export const FileUtils = {
    /**
     * Deleta uma música do File System local.
     */
    deleteLocalFile: async (fileUri: string) => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (fileInfo.exists) {
                await FileSystem.deleteAsync(fileUri);
                console.log(`File deleted: ${fileUri}`);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Failed to delete file:', e);
            return false;
        }
    },

    /**
     * Pega o diretório e calcula quanto o APP está consumindo de storage offline.
     * Útil para tela "Storage & Data" nas configs do app.
     */
    getOfflineStorageUsedSize: async (): Promise<number> => {
        try {
            if (!FileSystem.documentDirectory) return 0;

            const directoryContent = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
            let totalSize = 0;

            for (const fileName of directoryContent) {
                if (fileName.endsWith('.mp3')) {
                    const fileInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}${fileName}`, { size: true });
                    if (fileInfo.exists && fileInfo.size !== undefined) {
                        totalSize += fileInfo.size;
                    }
                }
            }

            return totalSize;
        } catch (e) {
            return 0;
        }
    },

    /**
     * Formata bytes para Mb ou Gb string
     */
    formatBytes: (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
};
