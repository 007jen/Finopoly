export const successResponse = (res: any, data: any, message = 'Success') => {
    res.status(200).json({ success: true, message, data });
};

export const errorResponse = (res: any, error: string, code = 500) => {
    res.status(code).json({ success: false, error });
};
