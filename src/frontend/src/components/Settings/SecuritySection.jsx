import React from 'react';
import PrivacyToggle from './PrivacyToggle';

const SecuritySection = ({ isPrivate, togglePrivacy }) => {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Security & Privacy</h2>
                <div className="bg-[#0B1221] border border-gray-800 rounded-xl p-5 space-y-5">

                    {/* THAY THẾ/THÊM TÙY CHỌN PRIVACY */}
                    <div className='flex items-center'>
                        <PrivacyToggle
                            isPrivate={isPrivate}
                            togglePrivacy={togglePrivacy}

                        />

                    </div>

                    <div className="h-px bg-gray-700 mx-[-5px]"></div> {/* Đường phân cách */}

                    {/* PHẦN CHANGE PASSWORD GIỮ NGUYÊN (HOẶC THAY ĐỔI ĐỂ KHỚP VỚI UI) */}
                    <div className='pt-2'>
                        <p className="text-sm text-gray-400 mb-4">Protect your account with a strong password.</p>
                        <button className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-lg border border-gray-700 transition-colors">
                            Change Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecuritySection;
