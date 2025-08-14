export default function WellKnown() {
  // DevTools や well-known パスへのアクセスを無視
  return new Response(null, { status: 404 });
}