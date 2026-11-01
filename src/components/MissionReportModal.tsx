import type { FC } from 'react';
import type { MarsSite, MarsCoordinate, MapLayerConfig, MissionRoutePlan, CandidateRoute } from '../types/mars';
import { generateMarkdownReport, downloadFile } from '../utils/reportExporter';
import { exportRouteToGeoJson } from '../utils/roverRouter';
import { FileText, Download, Printer, X, CheckCircle, ShieldAlert } from 'lucide-react';

interface MissionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSite: MarsSite | null;
  selectedCoordinate: MarsCoordinate | null;
  activeLayer: MapLayerConfig;
  missionRoute: MissionRoutePlan;
  activeRoute?: CandidateRoute;
}

export const MissionReportModal: FC<MissionReportModalProps> = ({
  isOpen,
  onClose,
  selectedSite,
  selectedCoordinate,
  activeLayer,
  missionRoute,
  activeRoute
}) => {
  if (!isOpen) return null;

  const markdownContent = generateMarkdownReport({
    selectedSite,
    selectedCoordinate,
    activeLayer,
    missionRoute,
    activeRoute
  });

  const handleDownloadMarkdown = () => {
    const filename = `GeoMars-Report-${(selectedSite?.id || 'surface-target')}-${Date.now()}.md`;
    downloadFile(markdownContent, filename, 'text/markdown');
  };

  const handleDownloadGeoJson = () => {
    if (!activeRoute) return;
    const geoJsonStr = exportRouteToGeoJson(
      activeRoute,
      missionRoute.startLabel,
      missionRoute.destinationLabel
    );
    const filename = `GeoMars-Route-${activeRoute.id}-${Date.now()}.geojson`;
    downloadFile(geoJsonStr, filename, 'application/geo+json');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="w-full max-w-3xl h-[680px] bg-[#111824] border border-[#273244] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#273244] bg-[#0D121C] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#080B12] border border-[#273244] text-[#FF6B35] flex items-center justify-center shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#F5F7FA] font-['Outfit',sans-serif]">
                Mission & Terrain Analysis Dossier
              </h2>
              <span className="text-[11px] text-[#94A3B8]">
                Exportable scientific telemetry, geodesic vector routes, and data provenance
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#94A3B8] hover:text-[#F5F7FA] rounded-lg hover:bg-[#0D121C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-2.5 bg-[#080B12] border-b border-[#273244] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <CheckCircle className="w-4 h-4 text-[#35C98A]" />
            <span>Verified MOLA areoid datum reference</span>
          </div>

          <div className="flex items-center gap-2">
            {activeRoute && (
              <button
                onClick={handleDownloadGeoJson}
                className="px-3 py-1.5 rounded-lg bg-[#0D121C] hover:bg-[#111824] border border-[#273244] hover:border-[#FF6B35]/60 text-xs text-[#F5F7FA] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#35C98A]" />
                <span>Export GeoJSON</span>
              </button>
            )}

            <button
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 rounded-lg bg-[#0D121C] hover:bg-[#111824] border border-[#273244] hover:border-[#FF6B35]/60 text-xs text-[#F5F7FA] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>Download Markdown</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#FF6B35] hover:bg-[#F5A65B] text-xs text-white font-semibold flex items-center gap-1.5 transition-colors shadow-[0_0_12px_rgba(255,107,53,0.3)] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Report Preview Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin text-xs text-[#F5F7FA] font-mono whitespace-pre-wrap leading-relaxed bg-[#080B12]">
          {markdownContent}
        </div>

        {/* Footer Notice */}
        <div className="px-6 py-3 border-t border-[#273244] bg-[#0D121C] flex items-center gap-2 text-[11px] text-[#94A3B8]">
          <ShieldAlert className="w-4 h-4 text-[#F5B942] shrink-0" />
          <span>
            Scientific Notice: Topographic metrics are estimated from regional MOLA DTMs. Final rover drive vectors require localized HiRISE hazard certification.
          </span>
        </div>
      </div>
    </div>
  );
};

