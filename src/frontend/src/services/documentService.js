import axiosInstance from '../hooks/useApi'; 

const BACKEND_ROOT = 'http://localhost:8080/api';


//route createDocument
export const createDocument = async (docData) => {
    try {
       
        const response = await axiosInstance.post(`${BACKEND_ROOT}/documents/`, docData);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Lỗi tạo tài liệu';
        throw new Error(message);
    }
};


//route getAllDocument


//route updateDocument

