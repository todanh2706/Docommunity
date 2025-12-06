import React from 'react';

const DangerZoneSection = ({ onDelete }) => {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-sm font-bold text-red-500/80 mb-3 uppercase tracking-wider">Danger Zone</h2>
                <div className="bg-red-900/25 border border-red-900/20 rounded-xl p-5">
                    <p className="text-sm text-red-200/60 mb-4">Once you delete your account, there is no going back.</p>
                    <button
                        onClick={onDelete}
                        className="w-full py-2 bg-transparent hover:bg-red-900/20 text-red-500 text-sm font-medium rounded-lg border border-red-900/30 hover:border-red-500/50 transition-all"
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" className="text-white bg-brand box-border border border-transparent hover:bg-brand-strong focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">Read more</a>

        </div>
    );
};

export default DangerZoneSection;
