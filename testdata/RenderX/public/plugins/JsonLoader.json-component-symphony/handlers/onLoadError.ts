export const handleComponentLoadingError = (data: any): any => {
    console.log('🎼 JsonLoader Handler: Component Loading Error', data);
    try {
        return { success: true, errorHandled: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
};

export default handleComponentLoadingError;
