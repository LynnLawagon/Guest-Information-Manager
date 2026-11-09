(() => {
  const KEY = "guestInfoManager.records.v1";
  const list = document.getElementById("records-list");
  const empty = document.getElementById("empty-state");
  const search = document.getElementById("search");
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
  const write = rows => localStorage.setItem(KEY, JSON.stringify(rows));
  const safe = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[c]));
  const dateText = value => value ? new Date(value).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"}) : "—";
  function render() {
    const all = read(); const term = search.value.trim().toLowerCase();
    const rows = all.filter(r => `${r.First_name} ${r.Middle_name} ${r.Last_name} ${r.reference_id}`.toLowerCase().includes(term));
    document.getElementById("total-count").textContent = all.length;
    document.getElementById("latest-date").textContent = all.length ? dateText(all[0].created_at) : "—";
    list.innerHTML = rows.map(r => `<tr><td><strong>${safe([r.First_name,r.Middle_name,r.Last_name].filter(Boolean).join(" "))}</strong><small>${safe(r.ID_type || "Guest")}</small></td><td><span class="ref-tag">${safe(r.reference_id)}</span></td><td>${safe(dateText(r.created_at))}</td><td class="row-actions"><button class="text-action pdf-action" data-ref="${safe(r.reference_id)}">Download PDF</button><button class="text-action delete-action" data-delete="${safe(r.reference_id)}">Delete</button></td></tr>`).join("");
    empty.hidden = rows.length > 0;
    document.querySelector(".table-wrap").hidden = rows.length === 0;
  }
  search.addEventListener("input", render);
  list.addEventListener("click", async e => {
    const pdf = e.target.closest("[data-ref]"); const del = e.target.closest("[data-delete]");
    if (del) { if (confirm("Delete this guest record from this browser? This cannot be undone unless you have a backup.")) { write(read().filter(r => r.reference_id !== del.dataset.delete)); render(); } }
    if (pdf) {
      const record = read().find(r => r.reference_id === pdf.dataset.ref); if (!record) return;
      pdf.disabled = true; pdf.textContent = "Preparing…";
      try {
        const response = await fetch("/export-pdf", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(record)});
        if (!response.ok) throw new Error("Could not generate the PDF.");
        const blob = await response.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href=url; a.download=`${record.reference_id}.pdf`; a.click(); URL.revokeObjectURL(url);
      } catch (err) { alert(err.message); }
      finally { pdf.disabled=false; pdf.textContent="Download PDF"; }
    }
  });
  document.getElementById("export-backup").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({format:"guestInfoManagerBackup",version:1,exported_at:new Date().toISOString(),records:read()},null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`guest-records-backup-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
  });
  document.getElementById("import-backup").addEventListener("change", async e => {
    const file=e.target.files[0]; if(!file)return;
    try { const data=JSON.parse(await file.text()); if(!Array.isArray(data.records))throw new Error("This backup file is not valid.");
      const current=read(); const map=new Map(current.map(r=>[r.reference_id,r])); data.records.forEach(r=>{if(r.reference_id)map.set(r.reference_id,r)}); write([...map.values()]); render(); alert(`Imported ${data.records.length} record(s).`);
    } catch(err){alert(err.message || "Unable to import backup.")} finally{e.target.value=""}
  });
  render();
})();
