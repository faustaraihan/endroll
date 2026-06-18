import { useState, useEffect } from "react";
import {
  Search,
  Star,
  ChevronLeft,
  Plus,
  Check,
  PenLine,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "../../contexts";
import { useStore } from "../../store/useStore";
import { Poster } from "../../components";
import { formatDate } from "../../utils";
import type { SearchResult, Title, TitleType } from "../../types";
import styles from "./LogFilm.module.css";

type Step = "search" | "manual" | "form";

const DRAFT_KEY = "endroll:log-draft";

interface LogDraft {
  selectedTitle: SearchResult | Title;
  watchedAt: string;
  rating: number | null;
  notes: string;
  editingLogId: string | null;
  savedAt: string;
}

function readDraft(): LogDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LogDraft;
    if (!parsed.selectedTitle?.title) return null;
    return parsed;
  } catch {
    return null;
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

export default function LogFilm() {
  const setWatchLogs = useStore(state => state.setWatchLogs);
  const watchLogs = useStore(state => state.watchLogs);
  const personalRatings = useStore(state => state.personalRatings);
  const setRatingForTitle = useStore(state => state.setRatingForTitle);
  const exploreData = useStore(state => state.exploreData);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState<Step>("search");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<
    SearchResult | Title | null
  >(null);

  // Form state
  const [watchedAt, setWatchedAt] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [rating, setRating] = useState<number | null>(null);
  const [ratingInput, setRatingInput] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual add state
  const [manualTitle, setManualTitle] = useState("");
  const [manualType, setManualType] = useState<TitleType>("film");
  const [manualYear, setManualYear] = useState("");

  // Draft (catatan belum tersimpan) — hanya ditawarkan jika tidak datang
  // membawa judul dari halaman lain
  const [pendingDraft, setPendingDraft] = useState<LogDraft | null>(() =>
    location.state?.title ? null : readDraft(),
  );

  // Edit state
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Pre-select title from router state (e.g. from Search page) —
  // penyesuaian state saat render, bukan effect
  const stateTitle = location.state?.title as SearchResult | Title | undefined;
  const [handledStateTitle, setHandledStateTitle] = useState<
    SearchResult | Title | null
  >(null);
  if (stateTitle && stateTitle !== handledStateTitle) {
    setHandledStateTitle(stateTitle);
    handleSelect(stateTitle);
  }

  // Live search dengan debounce — tanpa perlu menekan tombol
  function handleQueryChange(value: string) {
    setQuery(value);
    if (value.trim().length < 3) {
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
    } else {
      setIsSearching(true);
    }
  }

  useEffect(() => {
    if (query.trim().length < 3) return;
    const timer = setTimeout(() => {
      // Simulate API search by checking all explore data
      const allSearchable = Array.from(
        new Map(
          [
            ...exploreData.trending,
            ...exploreData.nowPlaying,
            ...exploreData.classics,
            ...exploreData.upcoming,
            ...exploreData.searchResults,
          ].map((item) => [item.tmdb_id, item]),
        ).values(),
      );

      const filtered = allSearchable.filter((r) =>
        r.title.toLowerCase().includes(query.toLowerCase()),
      );
      setSearchResults(filtered);
      setHasSearched(true);
      setIsSearching(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [query, exploreData]);

  // Simpan draft otomatis selama mengisi form, agar catatan tidak pernah hilang
  useEffect(() => {
    if (step !== "form" || !selectedTitle) return;
    const draft: LogDraft = {
      selectedTitle,
      watchedAt,
      rating,
      notes,
      editingLogId,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [step, selectedTitle, watchedAt, rating, notes, editingLogId]);



  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Pencarian sudah berjalan otomatis; Enter hanya mencegah reload
  }

  function handleSelect(result: SearchResult | Title) {
    startFormForTitle(result);
  }

  function startFormForTitle(result: SearchResult | Title) {
    setSelectedTitle(result);
    setEditingLogId(null);
    setWatchedAt(new Date().toISOString().slice(0, 10));

    // Cari rating global dari film ini
    const existingWatch = watchLogs.find(
      (l) =>
        ("id" in result && l.title.id === result.id) ||
        (result.tmdb_id && l.title.tmdb_id === result.tmdb_id),
    );
    const existingRating = existingWatch
      ? (personalRatings[existingWatch.title.id] ?? null)
      : null;

    setRating(existingRating);
    setRatingInput(existingRating !== null ? existingRating.toFixed(1) : "");
    setNotes("");
    setPendingDraft(null);
    setStep("form");
  }

  function handleResumeDraft() {
    if (!pendingDraft) return;
    setSelectedTitle(pendingDraft.selectedTitle);
    setEditingLogId(pendingDraft.editingLogId);
    setWatchedAt(pendingDraft.watchedAt);
    setRating(pendingDraft.rating);
    setRatingInput(
      pendingDraft.rating !== null ? pendingDraft.rating.toFixed(1) : "",
    );
    setNotes(pendingDraft.notes);
    setPendingDraft(null);
    setStep("form");
  }

  function handleDiscardDraft() {
    clearDraft();
    setPendingDraft(null);
  }

  function handleBack() {
    if (notes.trim()) {
      // The draft is already saved automatically — reassure the user
      addToast("Your note has been saved as a draft.", "info");
      setPendingDraft(readDraft());
    } else {
      clearDraft();
    }
    setStep("search");
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualTitle.trim()) return;
    const year = parseInt(manualYear, 10);
    const title: Title = {
      id: crypto.randomUUID(),
      title: manualTitle.trim(),
      type: manualType,
      release_year: Number.isFinite(year) ? year : undefined,
      genres: [],
      cast: [],
    };
    startFormForTitle(title);
  }



  function handleRatingChange(val: string) {
    setRatingInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      setRating(num);
    } else {
      setRating(null);
    }
  }

  function handleSlider(val: number) {
    // Sesuai PRD: slider snap ke 0.5 terdekat (input angka tetap presisi 0.1)
    const snapped = Math.round(val * 2) / 2;
    setRating(snapped);
    setRatingInput(snapped.toFixed(1));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTitle) return;

    setIsSubmitting(true);
    setTimeout(() => {
      // Cari atau buat title ID yang stabil
      const existingWatch = watchLogs.find(
        (l) =>
          ("id" in selectedTitle && l.title.id === selectedTitle.id) ||
          (selectedTitle.tmdb_id && l.title.tmdb_id === selectedTitle.tmdb_id),
      );
      const titleIdToUse = existingWatch
        ? existingWatch.title.id
        : "id" in selectedTitle
          ? selectedTitle.id
          : crypto.randomUUID();

      const titleToUse = existingWatch
        ? existingWatch.title
        : {
            id: titleIdToUse,
            tmdb_id: selectedTitle.tmdb_id,
            title: selectedTitle.title,
            type: selectedTitle.type,
            poster_path: selectedTitle.poster_path,
            release_year: selectedTitle.release_year,
            genres: selectedTitle.genres,
            cast: "cast" in selectedTitle ? selectedTitle.cast : [],
            director:
              "director" in selectedTitle ? selectedTitle.director : undefined,
            runtime_minutes:
              "runtime_minutes" in selectedTitle
                ? selectedTitle.runtime_minutes
                : undefined,
            overview: selectedTitle.overview,
          };

      // Update rating global
      setRatingForTitle(titleIdToUse, rating);

      if (editingLogId) {
        // Editing existing log
        setWatchLogs((prev) =>
          prev.map((l) =>
            l.id === editingLogId
              ? {
                  ...l,
                  watched_at: watchedAt,
                  notes: notes || undefined,
                  season_number: undefined,
                }
              : l,
          ),
        );
        addToast(`Entry for "${selectedTitle.title}" updated 🎬`, "success");
      } else {
        // Adding new log
        // Hitung rewatch secara otomatis
        const rewatchCount = watchLogs.filter(
          (l) => l.title_id === titleIdToUse,
        ).length;

        const newLog = {
          id: crypto.randomUUID(),
          user_id: "u1",
          title_id: titleIdToUse,
          title: titleToUse,
          watched_at: watchedAt,
          notes: notes || undefined,
          rewatch_count: rewatchCount,
          season_number: undefined,
        };

        setWatchLogs((prev) => [newLog, ...prev]);
        addToast(`"${selectedTitle.title}" logged to your diary 🎬`, "success");
      }
      clearDraft();
      setIsSubmitting(false);
      navigate("/diary");
    }, 600);
  }

  return (
    <div className={styles.page}>
      {step === "search" && (
        <div className={styles.searchStep} style={{ animationName: "fade-in" }}>
          <header className={styles.header}>
            <p className="eyebrow" style={{ marginBottom: 8 }}>
              Capture
            </p>
            <h1 className={styles.pageTitle}>Log a film or series</h1>
            <p className={styles.pageSub}>
              Search for the title you just watched
            </p>
          </header>

          {/* Unsaved draft */}
          {pendingDraft && (
            <div className={styles.draftBanner} role="status">
              <PenLine size={16} className={styles.draftIcon} />
              <div className={styles.draftText}>
                <strong>{pendingDraft.selectedTitle.title}</strong> is still
                waiting — your note was saved on{" "}
                {formatDate(pendingDraft.savedAt)}.
              </div>
              <div className={styles.draftActions}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleResumeDraft}
                >
                  Resume
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={handleDiscardDraft}
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSearchSubmit}
            className={styles.searchForm}
            role="search"
          >
            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                id="log-search"
                type="search"
                className={styles.searchInput}
                placeholder="Type a film or series title…"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                aria-label="Search for a film or series"
                autoFocus
                autoComplete="off"
              />
            </div>
          </form>

          {isSearching && (
            <ul
              className={styles.resultList}
              role="list"
              aria-label="Loading search results"
              aria-busy="true"
            >
              {[0, 1, 2, 3].map((i) => (
                <li key={i} className={styles.skeletonRow}>
                  <div className={`skeleton ${styles.skeletonPoster}`} />
                  <div className={styles.skeletonLines}>
                    <div className={`skeleton ${styles.skeletonLine}`} />
                    <div className={`skeleton ${styles.skeletonLineShort}`} />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!isSearching && hasSearched && searchResults.length > 0 && (
            <ul
              className={styles.resultList}
              role="list"
              aria-label="Search results"
            >
              {searchResults.map((result) => (
                <li key={result.tmdb_id}>
                  <button
                    className={styles.resultItem}
                    onClick={() => handleSelect(result)}
                    aria-label={`Select ${result.title} (${result.release_year})`}
                  >
                    <div className={styles.resultPosterWrap}>
                      <Poster
                        title={result.title}
                        src={result.poster_path}
                        alt={`Poster ${result.title}`}
                        className={styles.resultPoster}
                        size="sm"
                      />
                    </div>
                    <div className={styles.resultInfo}>
                      <div className={styles.resultTitle}>{result.title}</div>
                      <div className={styles.resultMeta}>
                        <span className="badge badge-muted">
                          {result.type === "film" ? "Film" : "Series"}
                        </span>
                        {result.release_year && (
                          <span className="text-sm text-muted">
                            {result.release_year}
                          </span>
                        )}
                      </div>
                    </div>
                    <Plus size={18} className={styles.resultAdd} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!isSearching && hasSearched && searchResults.length === 0 && (
            <div className={styles.noResults}>
              <p>
                No results for "<strong>{query}</strong>".
              </p>
              <p className="text-sm text-muted">
                Try checking the spelling — or just add it manually.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setManualTitle(query);
                  setStep("manual");
                }}
              >
                <PenLine size={14} /> Add manually
              </button>
            </div>
          )}

        </div>
      )}

      {step === "manual" && (
        <form
          onSubmit={handleManualSubmit}
          className={styles.formStep}
          aria-label="Add title manually"
        >
          <button
            type="button"
            className={`btn btn-ghost btn-sm ${styles.backBtn}`}
            onClick={() => setStep("search")}
          >
            <ChevronLeft size={16} /> Back
          </button>

          <header className={styles.header}>
            <h1 className={styles.pageTitle}>Add Manually</h1>
            <p className={styles.pageSub}>
              Not every title is on TMDb — just log it yourself.
            </p>
          </header>

          <div className={styles.formGroup}>
            <label htmlFor="manual-title" className="input-label">
              Title
            </label>
            <input
              id="manual-title"
              type="text"
              className="input"
              placeholder="Film or series title"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              maxLength={200}
              required
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <span className="input-label" id="manual-type-label">
              Type
            </span>
            <div
              className={styles.typeToggle}
              role="group"
              aria-labelledby="manual-type-label"
            >
              {(["film", "series"] as TitleType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`${styles.typeToggleBtn} ${manualType === t ? styles.typeToggleBtnActive : ""}`}
                  onClick={() => setManualType(t)}
                  aria-pressed={manualType === t}
                >
                  {t === "film" ? "Film" : "Series"}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="manual-year" className="input-label">
              Release year <span className={styles.labelHint}>(optional)</span>
            </label>
            <input
              id="manual-year"
              type="number"
              className={`input ${styles.dateInput}`}
              placeholder="2026"
              min={1888}
              max={new Date().getFullYear() + 5}
              value={manualYear}
              onChange={(e) => setManualYear(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary btn-lg ${styles.submitBtn}`}
            disabled={!manualTitle.trim()}
          >
            <Check size={18} /> Continue to notes
          </button>
        </form>
      )}

      {step === "form" && selectedTitle && (
        <form
          onSubmit={handleSubmit}
          className={styles.formStep}
          aria-label="Log film form"
        >
          <button
            type="button"
            className={`btn btn-ghost btn-sm ${styles.backBtn}`}
            onClick={handleBack}
          >
            <ChevronLeft size={16} /> Back
          </button>

          {/* Title preview */}
          <div className={styles.titlePreview}>
            <div className={styles.previewBackdrop}>
              {selectedTitle.poster_path ? (
                <img
                  src={selectedTitle.poster_path}
                  alt=""
                  aria-hidden="true"
                  className={styles.previewBackdropImg}
                />
              ) : (
                <div className={styles.previewBackdropFallback} />
              )}
            </div>
            <div className={styles.previewGradient} />
            <div className={styles.previewContent}>
              <div className={styles.previewPosterWrap}>
                <Poster
                  title={selectedTitle.title}
                  src={selectedTitle.poster_path}
                  alt={`Poster ${selectedTitle.title} (${selectedTitle.release_year})`}
                  className={styles.previewPoster}
                  size="sm"
                />
              </div>
              <div className={styles.previewInfo}>
                <p className={styles.previewEyebrow}>
                  {selectedTitle.type === "film" ? "Film" : "Series"}
                </p>
                <h1 className={styles.previewTitle}>{selectedTitle.title}</h1>
                <div className={styles.previewMeta}>
                  {selectedTitle.release_year && (
                    <span>{selectedTitle.release_year}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.formDivider} />

          {/* Watched date */}
          <div className={styles.formGroup}>
            <label htmlFor="watched-date" className="input-label">
              Watched on
            </label>
            <input
              id="watched-date"
              type="date"
              className={`input ${styles.dateInput}`}
              value={watchedAt}
              onChange={(e) => setWatchedAt(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              required
            />
          </div>

          {/* Rating */}
          <div className={styles.formGroup}>
            <label
              htmlFor="rating-input"
              className="input-label"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <span>
                Rating for this{" "}
                {selectedTitle.type === "film" ? "film" : "series"}{" "}
                <span className={styles.labelHint}>(global · optional)</span>
              </span>
              {rating !== null && (
                <button
                  type="button"
                  className={styles.clearRatingBtn}
                  onClick={() => {
                    setRating(null);
                    setRatingInput("");
                  }}
                >
                  Clear rating
                </button>
              )}
            </label>
            <div className={styles.ratingRow}>
              <input
                id="rating-range"
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={rating ?? 5}
                onChange={(e) => handleSlider(parseFloat(e.target.value))}
                className={`${styles.slider} ${rating === null ? styles.sliderUnrated : ""}`}
                style={{
                  background: `linear-gradient(to right, var(--accent, #d9a441) ${(rating ?? 5) * 10}%, var(--border, rgba(255, 255, 255, 0.1)) ${(rating ?? 5) * 10}%)`,
                }}
                aria-label="Drag to rate from 0 to 10"
                aria-valuetext={
                  rating !== null ? rating.toFixed(1) : "Not rated yet"
                }
              />
              <div className={styles.ratingInputWrap}>
                <Star
                  size={14}
                  fill={rating != null ? "var(--color-amber-400)" : "none"}
                  color="var(--color-amber-400)"
                />
                <input
                  id="rating-input"
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  className={styles.ratingText}
                  placeholder="—"
                  value={ratingInput}
                  onChange={(e) => handleRatingChange(e.target.value)}
                  aria-label="Enter rating as a number"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className={styles.formGroup}>
            <label htmlFor="notes" className="input-label">
              Notes
              <span className={styles.labelHint}>(optional)</span>
            </label>
            <textarea
              id="notes"
              className={`input ${styles.textarea}`}
              placeholder="How did it make you feel? Jot down anything you want to remember…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
            />
            <div className={styles.charCount}>{notes.length}/1000</div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`btn btn-primary btn-lg ${styles.submitBtn}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className={styles.btnSpinner} /> Saving…
              </>
            ) : (
              <>
                <Check size={18} /> Save to Diary
              </>
            )}
          </button>
        </form>
      )}


    </div>
  );
}
