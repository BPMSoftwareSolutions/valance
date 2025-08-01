export const handleComponentLoadingProgress = (data: any): any => {
    console.log('🎼 JsonLoader Handler: Component Loading Progress', data);
    try {
        return { success: true, progress: data.progress || 0 };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
};

export default handleComponentLoadingProgress;
