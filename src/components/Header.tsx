interface HeaderProps {
  showSubtitle?: boolean;
}

export function Header({ showSubtitle = true }: HeaderProps) {
  return (
    <header className="text-center mb-8 animate-slide-down">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 text-gradient">
        P2L - Problem to Lecture
      </h1>
      {showSubtitle && (
        <p className="text-gray-600 text-sm">
          문제 이미지를 업로드하면 관련 강의 부분을 찾아드려요
        </p>
      )}
    </header>
  );
}
