import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/lib/assets/MarkerCluster.css";
import "react-leaflet-cluster/lib/assets/MarkerCluster.Default.css";
import { fetchProjects, type Project } from "../features/projects/projectsApi";
import { configureLeafletIcons } from "../features/maps/leaflet";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Drawer from "../components/ui/Drawer";
import useMediaQuery from "../hooks/useMediaQuery";
import StatusPill from "../components/StatusPill";

configureLeafletIcons();

function MapReady({ onReady }: { onReady: (map: LeafletMap) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

export default function MapPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("ALL");
  const [county, setCounty] = useState("ALL");
  const [minProgress, setMinProgress] = useState(0);
  const [maxProgress, setMaxProgress] = useState(100);
  const [selected, setSelected] = useState<Project | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const mapRef = useRef<LeafletMap | null>(null);
  const isMobile = useMediaQuery("(max-width: 980px)");

  useEffect(() => {
    (async () => {
      try {
        setErr(null);
        setLoading(true);
        const data = await fetchProjects();
        setProjects(data);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load projects");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const counties = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.county && set.add(p.county));
    return ["ALL", ...Array.from(set).sort()];
  }, [projects]);

  const projectsWithCoords = useMemo(
    () =>
      projects.filter(
        (p) =>
          p.latitude !== null &&
          p.longitude !== null &&
          p.latitude !== undefined &&
          p.longitude !== undefined
      ),
    [projects]
  );

  const filtered = useMemo(() => {
    return projectsWithCoords.filter((p) => {
      const statusMatch = status === "ALL" || (p.status || "").toUpperCase() === status;
      const countyMatch = county === "ALL" || (p.county || "") === county;
      const progress = Math.max(0, Math.min(100, Number(p.progress ?? 0)));
      const progressMatch = progress >= minProgress && progress <= maxProgress;
      return statusMatch && countyMatch && progressMatch;
    });
  }, [projectsWithCoords, status, county, minProgress, maxProgress]);

  function flyTo(project: Project) {
    if (mapRef.current && project.latitude && project.longitude) {
      mapRef.current.flyTo([Number(project.latitude), Number(project.longitude)], 11, { duration: 0.8 });
    }
  }

  const filterPanelContent = (
    <>
      <strong>Filters</strong>
      <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="ALL">All</option>
        <option value="PLANNED">Planned</option>
        <option value="ONGOING">Ongoing</option>
        <option value="COMPLETED">Completed</option>
        <option value="STALLED">Stalled</option>
      </Select>
      <Select label="County" value={county} onChange={(e) => setCounty(e.target.value)}>
        {counties.map((c) => (
          <option key={c} value={c}>{c === "ALL" ? "All" : c}</option>
        ))}
      </Select>
      <Input
        label="Min progress"
        type="number"
        min={0}
        max={100}
        value={minProgress}
        onChange={(e) => {
          const value = Math.max(0, Math.min(100, Number(e.target.value)));
          setMinProgress(value);
        }}
      />
      <Input
        label="Max progress"
        type="number"
        min={0}
        max={100}
        value={maxProgress}
        onChange={(e) => {
          const value = Math.max(0, Math.min(100, Number(e.target.value)));
          setMaxProgress(value);
        }}
      />
      <div className="muted">Showing {filtered.length} projects</div>
    </>
  );

  const filterPanel = <Card className="mapPanel">{filterPanelContent}</Card>;
  const desktopPanel = <Card className="mapPanel mapPanelDesktop">{filterPanelContent}</Card>;

  return (
    <div className="page">
      <div className="stack" style={{ gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 className="sectionTitle">Interactive Map</h2>
            <p className="muted">Explore projects by location and quickly jump into details.</p>
          </div>
          {isMobile ? (
            <Button variant="ghost" onClick={() => setFiltersOpen(true)}>Filters</Button>
          ) : null}
        </div>

        {err ? <div className="errorCard">{err}</div> : null}

        <div className="mapLayout">
          {!isMobile ? desktopPanel : null}
          <div className="stack">
            <div className="mapCanvas">
              <MapContainer
                center={[0.0236, 37.9062]}
                zoom={6}
                scrollWheelZoom
                style={{ height: "520px", width: "100%" }}
              >
                <MapReady onReady={(map) => (mapRef.current = map)} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MarkerClusterGroup chunkedLoading>
                  {filtered.map((p) => (
                    <Marker
                      key={p.id}
                      position={[Number(p.latitude), Number(p.longitude)]}
                      eventHandlers={{
                        click: () => {
                          setSelected(p);
                          flyTo(p);
                        },
                      }}
                    >
                      <Popup>
                        <div className="stack" style={{ gap: 6 }}>
                          <strong>{p.title}</strong>
                          <div className="muted">{p.county || "County not set"}</div>
                          <Link to={`/projects/${p.id}`} className="btn btnPrimary">Open details</Link>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              </MapContainer>
            </div>

            <div className="grid gridAuto">
              {loading ? (
                <Card className="emptyState">Loading projects…</Card>
              ) : filtered.length === 0 ? (
                <Card className="emptyState">No projects match the filters.</Card>
              ) : (
                filtered.slice(0, 6).map((p) => {
                  const progress = Math.max(0, Math.min(100, Number(p.progress ?? 0)));
                  return (
                  <Card key={p.id} className="projectCard" onClick={() => { setSelected(p); flyTo(p); }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div>
                        <strong>{p.title}</strong>
                        <div className="projectMeta">{p.county || "County not set"}</div>
                      </div>
                      <StatusPill status={p.status} />
                    </div>
                    <div className="muted" style={{ fontSize: 12 }}>Progress {progress}%</div>
                  </Card>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {selected && isMobile ? (
        <div className="bottomSheet">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>{selected.title}</strong>
            <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
          </div>
          <div className="muted">{selected.county || "County not set"}</div>
          <div className="inlineList">
            <StatusPill status={selected.status} />
            <Link className="btn btnPrimary" to={`/projects/${selected.id}`}>Open details</Link>
          </div>
        </div>
      ) : null}

      {!isMobile && selected ? (
        <Card className="mapPanel" style={{ position: "fixed", right: 20, bottom: 20, width: 320 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>{selected.title}</strong>
            <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
          </div>
          <div className="muted">{selected.county || "County not set"}</div>
          <StatusPill status={selected.status} />
          <Link className="btn btnPrimary" to={`/projects/${selected.id}`}>Open details</Link>
        </Card>
      ) : null}

      <Drawer isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        {filterPanel}
      </Drawer>
    </div>
  );
}
