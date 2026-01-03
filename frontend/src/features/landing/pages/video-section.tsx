import React, { useState } from 'react';
import { Play } from 'lucide-react';
import Modal from '@/shared/ui/modals/modal';

export default function VideoSection() {
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    return (
        <section className="py-32 relative overflow-hidden bg-white dark:bg-[#0a0a0a] transition-colors duration-500">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] -z-10" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-16">
                <div className="relative group max-w-5xl mx-auto">
                    {/* Video Thumbnail Wrapper */}
                    <div
                        className="relative aspect-video rounded-2xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] dark:shadow-[0_50px_100px_-20px_rgba(59,130,246,0.15)] border-[12px] border-gray-100/50 dark:border-white/5 cursor-pointer transform transition-all duration-1000 group-hover:scale-[1.01] group-hover:translate-y-[-10px]"
                        onClick={() => setIsVideoOpen(true)}
                    >
                        <img
                            src="/images/landing/video-thumbnail.png"
                            alt="Video Thumbnail"
                            className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                        />

                        {/* Overlay with radial gradient for focus */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-gray-900/60 via-transparent to-transparent group-hover:bg-gray-900/20 transition-all duration-700 flex items-center justify-center">
                            <div className="relative">
                                {/* Pulse circles */}
                                <div className="absolute inset-0 bg-white/30 rounded-full animate-ping scale-150 opacity-0 group-hover:opacity-100 transition-all" />
                                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse scale-[1.3] opacity-0 group-hover:opacity-100 transition-all" />

                                <div className="relative w-28 h-28 bg-white text-primary rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.5)] transform transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-active:scale-95">
                                    <Play className="w-12 h-12 fill-current ml-2" />
                                </div>
                            </div>
                        </div>

                        {/* Floating Text elements for premium look */}
                        <div className="absolute inset-0 p-12 flex flex-col justify-between pointer-events-none">
                            <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-all duration-1000 translate-y-[-20px] group-hover:translate-y-0">
                                <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                    <p className="text-white font-black text-sm uppercase tracking-tighter">HD Preview</p>
                                </div>
                            </div>

                            <div className="text-right opacity-0 group-hover:opacity-100 transition-all duration-1000 translate-y-[20px] group-hover:translate-y-0">
                                <p className="text-4xl font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] leading-tight">ابدأ بتبني مستقبلك اليوم</p>
                                <p className="text-xl font-bold text-gray-200 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">الحل الأمثل لإدارة التجارة الإلكترونية</p>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Background decorations */}
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-primary/30 to-blue-500/30 rounded-2xl -z-10 rotate-12 blur-2xl group-hover:rotate-45 transition-all duration-1000" />
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-2xl -z-10 -rotate-12 blur-3xl group-hover:rotate-[-30deg] transition-all duration-1000" />
                </div>
            </div>

            <Modal isOpen={isVideoOpen} onClose={() => setIsVideoOpen(false)} size="xl">
                <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl ring-12 ring-white/5 dark:ring-white/5 my-4">
                    <iframe
                        width="100%"
                        height="100%"
                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                    ></iframe>
                </div>
            </Modal>
        </section>
    );
}
