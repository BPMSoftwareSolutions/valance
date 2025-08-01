export const handleLayoutChanged = (data: any): any => {
    console.log('🎼 PanelToggle Handler: Layout Changed', data);
    try {
        return { success: true, layoutChanged: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
};

export default handleLayoutChanged;
