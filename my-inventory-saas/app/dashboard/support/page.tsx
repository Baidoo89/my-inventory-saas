'use client'

import { LifeBuoy, Mail, Phone, Youtube, Globe, ShieldCheck, Info } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Help & Support</h1>
        <p className="text-slate-500 mt-1">Get assistance and learn more about StockFlow.</p>
      </div>

      {/* Developer Contact Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-indigo-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <LifeBuoy className="text-indigo-600" size={24} /> 
            Developer Support
          </h2>
          <p className="text-slate-600 mt-1">
            Direct access to the engineering team for urgent issues and feature requests.
          </p>
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Info size={24} />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Lead Developer</p>
                    <p className="font-bold text-slate-900 text-lg">Benjamin Baidoo</p>
                    <p className="text-slate-500 text-sm">(TeCH Dalt89)</p>
                </div>
            </div>

            <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                    <Phone size={24} />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">WhatsApp / Phone</p>
                    <a href="https://wa.me/233557574477" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-900 text-lg hover:text-indigo-600 hover:underline">
                        055 757 4477
                    </a>
                    <p className="text-slate-500 text-sm">Available Mon-Sat, 8am - 6pm</p>
                </div>
            </div>

            <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                    <Mail size={24} />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">Email Support</p>
                    <a href="mailto:baido.dalt89@gmail.com" className="font-bold text-slate-900 text-lg hover:text-indigo-600 hover:underline">
                        baido.dalt89@gmail.com
                    </a>
                    <p className="text-slate-500 text-sm">Response within 24 hours</p>
                </div>
            </div>

            <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                    <Youtube size={24} />
                </div>
                <div>
                    <p className="text-xs font-bold text-slate-500 uppercase mb-1">YouTube Channel</p>
                    <a href="https://youtube.com/@techdalt89?si=C85o-IXP3XfBT5g0" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-900 text-lg hover:text-indigo-600 hover:underline">
                        TeCH Dalt89
                    </a>
                    <p className="text-slate-500 text-sm">Tutorials & Updates</p>
                </div>
            </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">About StockFlow</h2>
        <div className="prose prose-slate max-w-none text-slate-600">
            <p>
                StockFlow is a premier inventory management solution designed specifically for the Ghanaian market. 
                Our mission is to empower small and medium-sized businesses with professional tools to track sales, 
                manage stock, and grow their revenue.
            </p>
            <p className="mt-4">
                <strong>Version:</strong> 1.0.0 <br />
                <strong>Build:</strong> Production Release <br />
                <strong>Region:</strong> Ghana 🇬🇭
            </p>
        </div>
      </div>
    </div>
  )
}
