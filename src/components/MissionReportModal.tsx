import { useRef, useEffect } from 'react';
import type { FC } from 'react';
import type {
  MarsSite,
  MarsCoordinate,
  MapLayerConfig,
  MissionRoutePlan,
  CandidateRoute
} from '../types/mars';
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
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || 'closedBy' in HTMLDialogElement.prototype) return;

    const isOutside = (e: PointerEvent) => {
      const r = dialog.getBoundingClientRect();
      return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
    };

    let pressedOutside = false;
    const onDown = (e: PointerEvent) => {
      pressedOutside = isOutside(e);
    };
    const onUp = (e: PointerEvent) => {
      if (pressedOutside && isOutside(e)) dialog.close();
      pressedOutside = false;
    };

    dialog.addEventListener('pointerdown', onDown);
    dialog.addEventListener('pointerup', onUp);
    return () => {
      dialog.removeEventListener('pointerdown', onDown);
      dialog.removeEventListener('pointerup', onUp);
    };
  }, []);

  const resolvedRoute = activeRoute || missionRoute.activeCandidateRoute;

  const markdownContent = generateMarkdownReport({
    selectedSite,
    selectedCoordinate,
    activeLayer,
    missionRoute,
    activeRoute: resolvedRoute
  });

  const handleDownloadMarkdown = () => {
    const filename = `GeoMarsXR-Report-${selectedSite?.id || 'surface-target'}-${Date.now()}.md`;
    downloadFile(markdownContent, filename, 'text/markdown');
  };

  const handleDownloadGeoJson = () => {
    if (!resolvedRoute) return;
    const geoJsonStr = exportRouteToGeoJson(
      resolvedRoute,
      missionRoute.startLabel,
      missionRoute.destinationLabel
    );
    const filename = `GeoMarsXR-Route-${resolvedRoute.id}-${Date.now()}.geojson`;
    downloadFile(geoJsonStr, filename, 'application/geo+json');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="mission-report-dialog-title"
      onClose={onClose}
      {...({ closedby: 'any' } as Record<string, string>)}
      className="m-auto w-full max-w-3xl h-[min(680px,90vh)] bg-[#111824] border border-[#273244] rounded-2xl shadow-2xl p-0 text-[#F5F7FA] overflow-hidden"
    >
      <div className="w-full h-full flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-[#273244] bg-[#0D121C] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#080B12] border border-[#273244] text-[#FF6B35] flex items-center justify-center shadow-inner">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="mission-report-dialog-title"
                className="text-[16px] font-bold text-[#F5F7FA] font-['Outfit',sans-serif]"
              >
                Mission & Terrain Analysis Dossier
              </h2>
              <span className="text-[11px] text-[#94A3B8]">
                Exportable scientific telemetry, A* vector routes, and data provenance
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close Mission Report Dossier"
            className="p-1.5 text-[#94A3B8] hover:text-[#F5F7FA] rounded-lg hover:bg-[#111824] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-2.5 bg-[#080B12] border-b border-[#273244] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <CheckCircle className="w-4 h-4 text-[#35C98A]" />
            <span>MOLA Areoid Datum + Deterministic Route Export</span>
          </div>

          <div className="flex items-center gap-2">
            {resolvedRoute && (
              <button
                type="button"
                onClick={handleDownloadGeoJson}
                className="px-3 py-1.5 rounded-lg bg-[#0D121C] hover:bg-[#111824] border border-[#273244] hover:border-[#FF6B35]/60 text-xs text-[#F5F7FA] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#35C98A]" />
                <span>Export GeoJSON</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="px-3 py-1.5 rounded-lg bg-[#0D121C] hover:bg-[#111824] border border-[#273244] hover:border-[#FF6B35]/60 text-xs text-[#F5F7FA] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>Download Markdown</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#FF6B35] hover:bg-[#F5A65B] text-xs text-white font-semibold flex items-center gap-1.5 transition-colors shadow-[0_0_12px_rgba(255,107,53,0.3)] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin text-xs text-[#F5F7FA] font-mono whitespace-pre-wrap leading-relaxed bg-[#080B12]">
          {markdownContent}
        </div>

        <div className="px-6 py-3 border-t border-[#273244] bg-[#0D121C] flex items-center gap-2 text-[11px] text-[#94A3B8]">
          <ShieldAlert className="w-4 h-4 text-[#F5B942] shrink-0" />
          <span>
            Scientific Notice: Regional MOLA metrics and A* route costs are simulated
            decision-support estimates and are NOT certified flight-safe.
          </span>
        </div>
      </div>
    </dialog>
  );
};
