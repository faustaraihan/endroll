import { useState, useEffect } from "react";
import {
  Star,
  Check,
  PenLine,
  CalendarDays,
  Search as SearchIcon,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/contexts";
import { useStore } from "@/store/useStore";
import { PageHeader, SearchInput } from "@/components";
import { Poster } from "@/components/ui/Poster/Poster";
import { formatDate } from "@/utils";
import type { SearchResult, Title } from "@/types";
import styles from "./LogTitlePage.module.css";

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

export default function LogTitlePage() {
  const setWatchLogs = useStore(state => state.setWatchLogs);
  const watchLogs = useStore(state => state.watchLogs);
  const watchlist = useStore(state => state.watchlist);
  const setWatchlist = useStore(state => state.setWatchlist);
  const personalRatings = useStore(state => state.personalRatings);
  const setRatingForTitle = useStore(state => state.setRatingForTitle);
  const exploreData = useStore(state => state.exploreData);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

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
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // Draft — hanya ditawarkan jika tidak datang membawa judul dari halaman lain
  const [pendingDraft, setPendingDraft] = useState<LogDraft | null>(() =>
    location.state?.title ? null : readDraft(),
  );

  // Live search dengan debounce
  useEffect(() => {
    if (query.trim().length < 3) {
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
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

  // Simpan draft otomatis
  useEffect(() => {
    if (!selectedTitle) return;
    const draft: LogDraft = {
      selectedTitle,
      watchedAt,
      rating,
      notes,
      editingLogId,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [selectedTitle, watchedAt, rating, notes, editingLogId]);

  function handleSelect(result: SearchResult | Title) {
    setSelectedTitle(result);
    setEditingLogId(null);
    setWatchedAt(new Date().toISOString().slice(0, 10));

    // Cari rating global dari movie ini
    const existingWatch = watchLogs.find(
      (l) =>
        ("id" in result && l.title.id === result.id) ||
        (result.tmdb_id && l.title.tmdb_id === result.tmdb_id),
    );
    const existingRating = existingWatch
      ? (personalRatings[existingWatch.title.id] ?? null)
      : null;

    setRating(existingRating);
    setNotes("");
    setPendingDraft(null);
  }

  function handleResumeDraft() {
    if (!pendingDraft) return;
    setSelectedTitle(pendingDraft.selectedTitle);
    setEditingLogId(pendingDraft.editingLogId);
    setWatchedAt(pendingDraft.watchedAt);
    setRating(pendingDraft.rating);
    setNotes(pendingDraft.notes);
    setPendingDraft(null);
  }

  function handleDiscardDraft() {
    clearDraft();
    setPendingDraft(null);
  }

  function handleSlider(val: number) {
    const snapped = Math.round(val * 2) / 2;
    setRating(snapped);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTitle) return;

    setIsSubmitting(true);
    setTimeout(() => {
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

      setRatingForTitle(titleIdToUse, rating);

      if (editingLogId) {
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
        addToast(`Entry for "${selectedTitle.title}" updated.`, "success");
      } else {
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

        const watchlistItem = watchlist.find(
          (w) =>
            (selectedTitle.tmdb_id != null &&
              w.title.tmdb_id === selectedTitle.tmdb_id) ||
            ("id" in selectedTitle && w.title.id === selectedTitle.id),
        );
        if (watchlistItem) {
          setWatchlist((prev) => prev.filter((w) => w.id !== watchlistItem.id));
          addToast(
            `"${selectedTitle.title}" moved from watchlist to diary.`,
            "success",
          );
        } else {
          addToast(`"${selectedTitle.title}" logged to your diary.`, "success");
        }
      }
      clearDraft();
      setIsSubmitting(false);
      navigate("/diary");
    }, 600);
  }

  function handleClear() {
    setSelectedTitle(null);
    setRating(null);
    setNotes("");
    setEditingLogId(null);
  }

  return (
    <div className={styles.page}>
      {/* ── Search ── */}
      <div style={{ animationName: "fade-in" }}>
        <PageHeader
          eyebrow="Capture"
          title={selectedTitle ? `Logging: ${selectedTitle.title}` : "Log a movie or series"}
          description={selectedTitle ? "Fill in the details below." : "Search for the title you just watched"}
        />

        {/* Unsaved draft banner */}
        {pendingDraft && !selectedTitle && (
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

        {!selectedTitle && (
          <form
            onSubmit={(e) => e.preventDefault()}
            className={styles.searchForm}
            role="search"
          >
            <SearchInput
              value={query}
              onChange={(val) => setQuery(val)}
              placeholder="Type a movie or series title…"
            />
          </form>
        )}

        {/* Search Results (hidden after selection) */}
        {!selectedTitle && isSearching && (
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

        {!selectedTitle && !isSearching && hasSearched && searchResults.length > 0 && (
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
                        {result.type === "movie" ? "Movie" : "Series"}
                      </span>
                      {result.release_year && (
                        <span className="text-sm text-muted">
                          {result.release_year}
                        </span>
                      )}
                    </div>
                  </div>
                  <PenLine size={18} className={styles.resultAdd} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {!selectedTitle && !isSearching && hasSearched && searchResults.length === 0 && (
          <div className={styles.noResults}>
            <SearchIcon size={36} strokeWidth={1.5} style={{ opacity: 0.3, marginBottom: 8 }} />
            <p>
              No results for "<strong>{query}</strong>".
            </p>
            <p className="text-sm text-muted">
              Try checking the spelling.
            </p>
          </div>
        )}
      </div>

      {/* ── Form (visible after selecting a title) ── */}
      {selectedTitle && (
        <form
          onSubmit={handleSubmit}
          className={styles.formStep}
          aria-label="Log movie form"
        >
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
                  {selectedTitle.type === "movie" ? "Movie" : "Series"}
                </p>
                <h1 className={styles.previewTitle}>{selectedTitle.title}</h1>
                <div className={styles.previewMeta}>
                  {selectedTitle.release_year && (
                    <span>{selectedTitle.release_year}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Change / Clear button */}
            <button
              type="button"
              className={styles.changeTitleBtn}
              onClick={handleClear}
              title="Choose a different title"
            >
              Change
            </button>
          </div>

          {/* Watched on */}
          <div className={styles.fieldCard}>
            <label htmlFor="watched-date" className={styles.fieldLabel}>
              Watched on
            </label>
            <div className={styles.dateRow}>
              <CalendarDays size={15} className={styles.fieldIcon} />
              <input
                id="watched-date"
                type="date"
                className={styles.dateInputNative}
                value={watchedAt}
                onChange={(e) => setWatchedAt(e.target.value)}
                max={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
          </div>

          {/* Rating */}
          <div className={styles.fieldCard}>
            <div className={styles.fieldCardHeader}>
              <span className={styles.fieldLabel}>
                Rating <span className={styles.labelHint}>· optional</span>
              </span>
              {rating !== null && (
                <button
                  type="button"
                  className={styles.clearRatingBtn}
                  onClick={() => setRating(null)}
                >
                  Clear rating
                </button>
              )}
            </div>

            <div className={styles.ratingDisplayRow}>
              <Star
                size={22}
                fill={rating != null ? "var(--accent, #d9a441)" : "none"}
                color={rating != null ? "var(--accent, #d9a441)" : "var(--color-text-muted)"}
                strokeWidth={1.5}
              />
              <span className={`${styles.ratingBig} ${rating === null ? styles.ratingBigMuted : ""}`}>
                {rating !== null ? rating.toFixed(1) : "\u2013"}
              </span>
              <span className={styles.ratingOutOf}>/10</span>
            </div>

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
                background: rating !== null
                  ? `linear-gradient(to right, var(--accent, #d9a441) ${rating * 10}%, var(--border, rgba(255, 255, 255, 0.1)) ${rating * 10}%)`
                  : undefined,
              }}
              aria-label="Drag to rate from 0 to 10"
              aria-valuetext={rating !== null ? rating.toFixed(1) : "Not rated yet"}
            />
          </div>

          {/* Notes */}
          <div className={styles.fieldCard}>
            <label htmlFor="notes" className={styles.fieldLabel}>
              Notes <span className={styles.labelHint}>· optional</span>
            </label>
            <textarea
              id="notes"
              className={styles.textarea}
              placeholder="How did it make you feel? Jot down anything you want to remember\u2026"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
            />
            <div className={styles.charCount}>{notes.length}/1000</div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className={styles.btnSpinner} /> Saving\u2026
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
