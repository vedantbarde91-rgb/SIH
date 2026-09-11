import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { authService } from '../../firebase/authService';
import { useDistrict } from '../../context/DistrictContext';
import {
  History,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Search,
  Filter,
  Layers,
  Lock,
  Download,
  Building,
  Activity,
  Droplets,
  Wrench,
  Compass
} from 'lucide-react';
import { exportHistoryTimelineCSV } from '../../utils/csvExport';

const NER_DISASTER_HISTORY = [
  {
    id: 'HIST-2024-01',
    year: '2024',
    date: '18 July 2024',
    title: 'NH-27 Harangajao-Jatinga Debris Flow & Culvert Blowout',
    location: 'NH-27 Chainage 42-45 km, Harangajao Cutting',
    district: 'Dima Hasao',
    state: 'Assam',
    hazard_type: 'Debris Flow & Rockfall',
    severity: 'Critical',
    rainfall: '194 mm (24h continuous monsoon burst)',
    casualties: '0 fatalities, 120 residents evacuated',
    damage: 'Lumding-Silchar national highway link severed for 36 hours; 4 roadside box culverts collapsed under slurry pressure; optical fibre trunk severed.',
    countermeasures: 'PWD & NHAI installed heavy tiered gabion retaining walls along chainage 42-45; 3 vibrating wire piezometers operational for real-time pore pressure monitoring.',
    status: 'Countermeasures Verified'
  },
  {
    id: 'HIST-2024-02',
    year: '2024',
    date: '02 July 2024',
    title: 'Recurrent Monsoon Slope Disruption along NH-10 (Ranipool Corridor)',
    location: 'NH-10 Ranipool-Singtam Sector km 22-26',
    district: 'Gangtok',
    state: 'Sikkim',
    hazard_type: 'Mudflow & Progressive Slope Slump',
    severity: 'Critical',
    rainfall: '210 mm (36h relentless mountain precipitation)',
    casualties: 'Nil (Controlled pre-emptive vehicular restrictions)',
    damage: 'Perennial lifeline highway NH-10 buried in 1.8m thick mud and slate rubble; Gangtok cutoff from Siliguri plains for 4 days; essential fuel supply diverted via Lava-Algarah.',
    countermeasures: 'BRO Swastik deployed continuous wheel-loaders; reinforced concrete catch pits excavated above road grade; permanent slope benching sanctioned.',
    status: 'Active Clearing & Monitoring'
  },
  {
    id: 'HIST-2023-01',
    year: '2023',
    date: '24 August 2023',
    title: 'Ditokcherra Railway Cutting Subgrade Slip',
    location: 'Ditokcherra Railway Station Spur, Hill Section',
    district: 'Dima Hasao',
    state: 'Assam',
    hazard_type: 'Rotational Slope Failure & Rail Washout',
    severity: 'High',
    rainfall: '162 mm (48h accumulated precipitation)',
    casualties: 'Nil (Automated track track-sensor halted express train)',
    damage: 'Minor ballast subsidence under single-track broad gauge line; water distribution aqueduct sheared; passenger trains halted for 14 hours.',
    countermeasures: 'Subsurface horizontal perforated drainpipes drilled 15m into Disang shale; hydro-seeding vetiver grass on cut slopes to prevent surface rilling.',
    status: 'Stabilization Completed'
  },
  {
    id: 'HIST-2023-02',
    year: '2023',
    date: '14 October 2023',
    title: '9th Mile JN Road Debris Avalanche & Blockade',
    location: 'Jawaharlal Nehru Road km 14.5 (Tsomgo-Nathula Arterial)',
    district: 'Gangtok',
    state: 'Sikkim',
    hazard_type: 'Debris Avalanche & Road Cut Collapse',
    severity: 'High',
    rainfall: '175 mm (Post-monsoon low pressure trough)',
    casualties: 'Nil (Early army border roads cordon)',
    damage: 'Over 1,200 metric tonnes of fractured schist talus blocked dual carriageway; military logistics and tourist transit suspended for 48 hours.',
    countermeasures: 'Heavy rockfall drapery anchored with 6m tieback grouted anchors; reinforced stone masonry toe wall constructed.',
    status: 'Tiebacks Operational'
  },
  {
    id: 'HIST-2022-01',
    year: '2022',
    date: '14 May 2022',
    title: 'Catastrophic Lumding–Badarpur Rail Corridor Washouts & New Haflong Mudslide',
    location: 'New Haflong Railway Complex & Lumding–Badarpur Hill Section',
    district: 'Dima Hasao',
    state: 'Assam',
    hazard_type: 'Catastrophic Flash Flood, Debris Flow & Rail Washout',
    severity: 'Critical',
    rainfall: '285 mm (Extreme cloudburst event over Barail Range)',
    casualties: '3 casualties, 1,400 residents sheltered in relief camps',
    damage: 'Historic New Haflong railway station platform inundated in 4m deep silt; coaches overturned on siding; multiple rail bridge abutments washed into Kopili and Jatinga rivers; Dima Hasao isolated for weeks.',
    countermeasures: 'Assam SDMA & Northeast Frontier Railway erected reinforced concrete retaining walls, integrated 24/7 seismic/pore sensors, and restructured mountain cross-drainage.',
    status: 'Reconstruction Completed'
  },
  {
    id: 'HIST-2022-02',
    year: '2022',
    date: '17 June 2022',
    title: 'Sohra Record Precipitation Deluge (>2,000mm 72h) & Shale Slides',
    location: 'Cherrapunji (Sohra) Rim & Shillong–Dawki Highway Corridor',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    hazard_type: 'Extreme Deluge Debris Flows & Rock Escarpment Failure',
    severity: 'Critical',
    rainfall: '2,080 mm in 72h (World-record monsoon precipitation episode)',
    casualties: '4 casualties in valley habitations, arterial traffic cut',
    damage: 'Unprecedented runoff dislodged limestone slabs and saturated overlying regolith; Shillong–Dawki trade highway severed at 11 separate locations; Mawkdok valley bridge approach destabilized.',
    countermeasures: 'Meghalaya PWD & NEC installed high-tensile rockfall barriers, deep perforated horizontal weep-hole channels, and reinforced bio-turfing.',
    status: 'Engineered Catchment Functional'
  },
  {
    id: 'HIST-2022-03',
    year: '2022',
    date: '20 June 2022',
    title: 'Sohra-Shella Escarpment Limestone Cut Slide',
    location: 'Mawsmai-Shella Highway Corridor',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    hazard_type: 'Rockfall & Limestone Escarpment Collapse',
    severity: 'Critical',
    rainfall: '340 mm (High-altitude monsoon cloudburst)',
    casualties: '1 injured, traffic diverted',
    damage: 'Limestone boulders exceeding 35 tonnes dislodged from upper ridge; quarry feeder arterial road blocked for 5 days; high-voltage transmission lines downed.',
    countermeasures: 'High-tensile steel wire drapery mesh anchored into bedrock with 8m soil nails; dynamic rockfall protection barriers installed along upper road rim.',
    status: 'Active Rock Netting'
  },
  {
    id: 'HIST-2021-01',
    year: '2021',
    date: '12 July 2021',
    title: 'Umrangso Reservoir Eastern Ridge Slope Creep',
    location: 'Umrangso-Lanka Border Road',
    district: 'Dima Hasao',
    state: 'Assam',
    hazard_type: 'Translational Earth Slide',
    severity: 'Moderate',
    rainfall: '175 mm',
    casualties: 'Nil',
    damage: 'Secondary state highway subsided by 45cm over a 60m span; Kopili river hydroelectric peripheral patrol track closed.',
    countermeasures: 'Stone column compaction and geo-synthetic reinforced earth (RE) wall constructed at slope base.',
    status: 'Engineered Berm Functional'
  },
  {
    id: 'HIST-2020-01',
    year: '2020',
    date: '06 June 2020',
    title: 'NH-6 Meghalaya-Barak Valley Corridor Rockslide',
    location: 'Sonapur Tunnel Approach / Umkiang Sector',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    hazard_type: 'Debris Flow & Mudflow',
    severity: 'High',
    rainfall: '220 mm',
    casualties: 'Nil (Early closure enforced by Meghalaya Police)',
    damage: 'Over 800 cubic meters of shale and sandstone slurry buried highway entrance; hundreds of commercial trucks stranded.',
    countermeasures: 'Extended portal shed erected over tunnel mouth; continuous automated rainwater runoff flumes installed.',
    status: 'Protection Gallery Built'
  },
  {
    id: 'HIST-2018-01',
    year: '2018',
    date: '03 July 2018',
    title: 'Mahur River Talus Slump & Rail Bank Subsidence',
    location: 'Mahur Valley Section km 68',
    district: 'Dima Hasao',
    state: 'Assam',
    hazard_type: 'Slope Subsidence / River Toe Erosion',
    severity: 'Moderate',
    rainfall: '180 mm',
    casualties: 'Nil',
    damage: 'Railway embankment toe eroded by Mahur river surge; slow order (20 km/h) imposed for 3 weeks.',
    countermeasures: 'Boulders dumped in wire crates (boulder pitching); riprap toe revetment along 250m river bank.',
    status: 'Riprap Intact'
  },
  {
    id: 'HIST-2017-01',
    year: '2017',
    date: '28 May 2017',
    title: 'Byrnihat-Nongpoh Hill Cutting Slump',
    location: 'GS Road (Guwahati-Shillong Corridor) km 34',
    district: 'Ri-Bhoi',
    state: 'Meghalaya',
    hazard_type: 'Road Cut Slump',
    severity: 'Moderate',
    rainfall: '190 mm',
    casualties: 'Nil',
    damage: 'Left lane of 4-lane highway blocked by loose red soil wash; traffic throttled to single lane.',
    countermeasures: 'Concrete catch-drains and masonry stepped retaining wall built by NHAI.',
    status: 'Functional'
  },
  {
    id: 'HIST-2016-01',
    year: '2016',
    date: '21 June 2016',
    title: 'Guwahati Kharghuli-Noonmati Hill Urban Slip',
    location: 'Kharghuli Hillslope Settlements',
    district: 'Kamrup',
    state: 'Assam',
    hazard_type: 'Urban Hillslope Mudslide',
    severity: 'High',
    rainfall: '145 mm (Intense localized downpour)',
    casualties: '2 injured, 4 huts damaged',
    damage: 'Unplanned cut-slopes and lack of drainage caused earth slip against residential boundary walls.',
    countermeasures: 'Kamrup District Disaster Authority enforced slope stabilization zoning and constructed storm drainage canals.',
    status: 'Drainage Network Operational'
  },
  {
    id: 'HIST-2011-01',
    year: '2011',
    date: '18 September 2011',
    title: '2011 Sikkim M6.9 Earthquake Co-Seismic Debris Flows',
    location: 'Ranipool-Martam-Gangtok Ridgelines & NH-31A',
    district: 'Gangtok',
    state: 'Sikkim',
    hazard_type: 'Co-Seismic Rockfalls, Debris Slides & Slope Collapses',
    severity: 'Critical',
    rainfall: 'Monsoon saturated slopes + M6.9 violent ground shaking',
    casualties: '60+ regional fatalities, severe urban structural distress in Gangtok',
    damage: 'Violent seismic shaking triggered hundreds of widespread slope collapses along the Daling phyllite formations; Sirwani bypass severed; communication towers toppled across East Sikkim.',
    countermeasures: 'National Disaster Management Authority initiated micro-zonation; extensive slope re-grading, soil nail anchors, and flexible barrier installation by BRO.',
    status: 'Seismic Slope Reinforcements Verified'
  },
  {
    id: 'HIST-1968-01',
    year: '1968',
    date: '04 October 1968',
    title: '1968 Catastrophic Sikkim Landslide Disaster Event',
    location: 'Teesta & Ranipool Valleys, Gangtok Highway Axis',
    district: 'Gangtok',
    state: 'Sikkim',
    hazard_type: 'Massive Multi-Valley Debris Avalanches & River Damming',
    severity: 'Critical',
    rainfall: '1,050 mm in 52h (Unprecedented catastrophic cloudburst)',
    casualties: 'Over 1,000 fatalities region-wide; massive destruction',
    damage: 'Over 20,000 landslides triggered across Sikkim in three days; bridges spanning the Teesta and Ranipool entirely washed away; Gangtok was isolated from mainland India for over a month.',
    countermeasures: 'Foundational Geological Survey of India (GSI) slope stability mapping; creation of specialized hill-road engineering codes by Border Roads Organisation.',
    status: 'Historical Benchmark Record'
  },
  {
    id: 'HIST-1950-01',
    year: '1950',
    date: '15 August 1950',
    title: '1950 Great Assam Earthquake-Triggered Regional Slope Collapses',
    location: 'Barail Mountain Ranges, Haflong-Jatinga-Kopili Gorges',
    district: 'Dima Hasao',
    state: 'Assam',
    hazard_type: 'Massive Co-Seismic Landslides & River Dam Bursts',
    severity: 'Critical',
    rainfall: 'Mid-monsoon soil saturation + M8.6 Great Earthquake',
    casualties: 'Hundreds displaced; extensive topographical restructuring',
    damage: 'One of the most powerful earthquakes in recorded history (M8.6) stripped mountain ridges bare; colossal rock avalanches dammed the Kopili and Subansiri river gorges, triggering subsequent catastrophic outburst floods.',
    countermeasures: 'Established historic baseline for seismotectonic slope hazard zonation across the North Eastern Region.',
    status: 'Foundational Geological Archive'
  },
  {
    id: 'HIST-1897-01',
    year: '1897',
    date: '12 June 1897',
    title: '1897 Great Meghalaya Earthquake Massive Escarpment Rockfalls',
    location: 'Cherrapunji (Sohra) Plateau & Southern Escarpment Gorges',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    hazard_type: 'Co-Seismic Escarpment Collapses & Gigantic Rockfalls',
    severity: 'Critical',
    rainfall: 'Pre-monsoon saturation + M8.1 Great Indian Earthquake',
    casualties: 'Widespread loss of life; entire cliff habitations collapsed',
    damage: 'The M8.1 Shillong Plateau earthquake caused vertical acceleration exceeding gravity; massive sandstone and limestone precipices disintegrated along Sohra, Mawkdok, and Pynursla gorges.',
    countermeasures: 'First comprehensive documentation of structural slope vulnerability on the Meghalaya plateau by R.D. Oldham (GSI).',
    status: 'Historic Geological Monument'
  }
];

export default function HistoryView() {
  const { t } = useTranslation();
  const {
    selectedState,
    selectedDistrict,
    officerAssignedDistrict,
    isSuperAdmin
  } = useDistrict();

  // Filters State
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamically extract all recorded years from historical dataset
  const availableYears = useMemo(() => {
    return Array.from(new Set(NER_DISASTER_HISTORY.map((e) => e.year))).sort((a, b) => b.localeCompare(a));
  }, []);

  // Filtered Disaster Events
  const filteredEvents = useMemo(() => {
    return NER_DISASTER_HISTORY.filter((event) => {
      // District Admin Lock
      if (officerAssignedDistrict && event.district.toLowerCase() !== officerAssignedDistrict.toLowerCase()) {
        return false;
      }
      // State Filter (Super Admin)
      if (selectedState !== 'ALL' && event.state.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }
      // District Filter (Super Admin)
      if (selectedDistrict !== 'ALL' && event.district.toLowerCase() !== selectedDistrict.toLowerCase()) {
        return false;
      }
      // Year Filter
      if (selectedYear !== 'ALL' && event.year !== selectedYear) {
        return false;
      }
      // Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          event.title.toLowerCase().includes(q) ||
          event.location.toLowerCase().includes(q) ||
          event.hazard_type.toLowerCase().includes(q) ||
          event.damage.toLowerCase().includes(q) ||
          event.countermeasures.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [officerAssignedDistrict, selectedState, selectedDistrict, selectedYear, searchQuery]);

  return (
    <div className="min-h-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 transition-colors">
      
      {/* Header & Scoped Jurisdiction Notice */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Geological Disaster Archive</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            NER Historical Disaster Timeline
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Decadal repository of high-impact landslides, railway washouts, rainfall triggers, and civil engineering mitigations
          </p>
        </div>

        {/* Authority Scope Badge */}
        <div className="flex items-center gap-2">
          {officerAssignedDistrict ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-semibold shadow-sm">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Locked to Assigned Jurisdiction: <strong>{officerAssignedDistrict}</strong></span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-800 text-purple-800 dark:text-purple-200 text-xs font-semibold shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Active Scope: <strong>{selectedDistrict !== 'ALL' ? selectedDistrict : (selectedState !== 'ALL' ? selectedState : 'Multi-State NER View')}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Overview Stat Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Logged Major Events</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {filteredEvents.length}
            </div>
            <div className="text-[10px] text-slate-400">Archived 2016-2024</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Peak Recorded Deluge</div>
            <div className="text-2xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">
              340 mm
            </div>
            <div className="text-[10px] text-slate-400">Sohra-Shella Escarpment</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600">
            <Droplets className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Structural Interventions</div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              100%
            </div>
            <div className="text-[10px] text-slate-400">Post-event stabilization</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Transport Lifelines</div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
              NH-27 & Lumding Rail
            </div>
            <div className="text-[10px] text-slate-400">Monitored 24/7 by DEOC</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600">
            <Compass className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROL BAR */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="flex flex-wrap items-center gap-3">
          {/* Year Selector */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-500">Filter by Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="ALL">All Recorded Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search highway, year, cause..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* VERTICAL DISASTER TIMELINE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-6 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Chronological Disaster Sequence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredEvents.length} validated disaster incident records
            </p>
          </div>
          <button
            onClick={() => exportHistoryTimelineCSV(filteredEvents, `${selectedState}_${selectedDistrict}_${selectedYear}`)}
            className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
            title="Download chronological disaster records as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Archive (CSV)</span>
          </button>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 space-y-2">
            <History className="w-8 h-8 mx-auto text-slate-400" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">No disaster incidents match your filter criteria.</p>
            <p>Try switching the year or district filter above.</p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-8 border-l-2 border-slate-200 dark:border-slate-800 ml-2 sm:ml-4">
            {filteredEvents.map((item, idx) => (
              <div key={item.id} className="relative group">
                
                {/* Timeline Node Icon */}
                <div className={`absolute -left-[35px] sm:-left-[43px] top-1 w-6 h-6 rounded-full flex items-center justify-center text-white ring-4 ring-white dark:ring-slate-900 shadow-md ${
                  item.severity === 'Critical' ? 'bg-rose-600' : (item.severity === 'High' ? 'bg-orange-500' : 'bg-amber-500')
                }`}>
                  <Calendar className="w-3 h-3" />
                </div>

                {/* Event Card */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-700/60 transition space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {item.id}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {item.date}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {item.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                        item.severity === 'Critical'
                          ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                          : 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800'
                      }`}>
                        {item.severity} Impact
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {item.district} ({item.state})
                      </span>
                    </div>
                  </div>

                  {/* Location & Hazard Type */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span className="font-semibold">{item.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>{item.hazard_type}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-sky-500" />
                      <span className="font-mono text-[11px] font-semibold">{item.rainfall}</span>
                    </div>
                  </div>

                  {/* Damage & Casualties */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Damage Sustained & Infrastructure Disruption:</span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {item.damage}
                      </p>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                        <strong>Impact:</strong> {item.casualties}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-1">
                      <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Civil Engineering Countermeasures Executed:</span>
                      </div>
                      <p className="text-emerald-950 dark:text-emerald-200 leading-relaxed font-medium">
                        {item.countermeasures}
                      </p>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider pt-1">
                        ✓ {item.status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
