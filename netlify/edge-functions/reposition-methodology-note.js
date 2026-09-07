export default async (request, context) => {
  const response = await context.next();
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html')) return response;

  let html = await response.text();
  const mover = `<script>(function(){function moveMethodNote(){const note=document.getElementById('homeModelNote');const actions=document.querySelector('#page-home .reference-hero-actions');if(!note||!actions)return false;note.style.cssText='margin:16px 0 6px;padding:12px 14px;border:1px solid #dfe5ec;border-radius:10px;background:#f8fafc;max-width:690px';note.innerHTML='<span style="font-size:10px;font-weight:900;letter-spacing:1.2px;color:#6d7d91;text-transform:uppercase">Methodology</span><span style="display:block;margin-top:4px;font-size:13px;line-height:1.45;font-weight:700;color:#314158">One of the only election forecasting sites to incorporate every U.S. Senate polling miss of the 21st century into its probability model.</span>';actions.insertAdjacentElement('afterend',note);return true}let tries=0;const timer=setInterval(()=>{tries++;if(moveMethodNote()||tries>40)clearInterval(timer)},100);})();<\/script>`;
  html = html.replace('</body>', mover + '</body>');
  const headers = new Headers(response.headers);
  headers.delete('content-length');
  return new Response(html, { status: response.status, statusText: response.statusText, headers });
};
