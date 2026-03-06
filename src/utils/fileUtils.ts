// @ts-ignore - APIs exist at runtime
import * as FileSystem from 'expo-file-system';

export const FileUtils = {
    deleteFile: async (filePath: string): Promise<boolean> => {
        try {
            await FileSystem.deleteAsync(filePath, { idempotent: true });
            return true;
        } catch (error) {
            console.error('Failed to delete file:', error);
            return false;
        }
    },

    formatBytes: (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    },

    getStorageSize: async (): Promise<number> => {
        try {
            // @ts-ignore
            if (!FileSystem.documentDirectory) return 0;
            // @ts-ignore
            const directoryContent = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
            let totalSize = 0;

            for (const fileName of directoryContent) {
                try {
                    // @ts-ignore
                    const fileInfo = await FileSystem.getInfoAsync(`${FileSystem.documentDirectory}${fileName}`);
                    if (fileInfo.exists && (fileInfo as any).size) {
                        totalSize += (fileInfo as any).size;
                    }
                } catch {
                    // Skip
                }
            }

            return totalSize;
        } catch (error) {
            console.error('Failed to get storage size:', error);
            return 0;
        }
    },
};