import { useYiYan } from "../hooks/useYiYan";

export function YiYan() {
  const { yiyan, loading, error } = useYiYan();

  if (loading) {
    return (
      <div className="text-center text-sm text-muted-foreground animate-pulse">
        正在加载一言...
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-sm text-destructive">{error}</div>;
  }

  if (!yiyan) {
    return null;
  }

  return (
    <div className="text-center space-y-1">
      <p className="text-sm text-foreground">『{yiyan.content}』</p>
      <p className="text-xs text-muted-foreground">
        —— {yiyan.form} · {yiyan.creator}
      </p>
    </div>
  );
}
