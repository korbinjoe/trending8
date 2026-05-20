export default function LocaleSegmentLoading() {
  return (
    <div className="page-loading" aria-busy="true" aria-label="Loading page">
      <div className="page-loading__bar skeleton" />
    </div>
  );
}
