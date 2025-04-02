import { useYiYan } from "../hooks/useYiYan";

export function YiYan() {
  const { yiyan, loading, error } = useYiYan();

  if (loading) {
    return (
      <div className="text-sm text-muted-foreground animate-pulse">
        正在加载一言...
      </div>
    );
  }

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>;
  }

  if (!yiyan) {
    return null;
  }

  return (
    <div className="text-sm text-muted-foreground">『{yiyan.content}』</div>
  );
}
