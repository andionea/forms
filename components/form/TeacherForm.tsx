"use client";

import { useState } from "react";

const ANI_SCOLARI = ["2021-2022", "2022-2023", "2023-2024", "2024-2025", "2025-2026"];

interface Curs {
  id: string;
  denumireCurs: string;
  nrCredite: string;
  furnizor: string;
}

interface Publicatie {
  id: string;
  titlu: string;
  issnIsbn: string;
  locPublicare: string;
}

interface ActivitateRemediala {
  id: string;
  materia: string;
  clasa: string;
  nrElevi: string;
  progresElev: string;
}

export function TeacherForm() {
  const [nume, setNume] = useState("");
  const [prenume, setPrenume] = useState("");
  const [anCurent, setAnCurent] = useState(ANI_SCOLARI[4]);

  const [datePeAni, setDatePeAni] = useState<Record<string, { cursuri: Curs[], publicatii: Publicatie[], activitatiRemediale: ActivitateRemediala[] }>>(() => {
    return ANI_SCOLARI.reduce((acc, an) => {
      acc[an] = { cursuri: [], publicatii: [], activitatiRemediale: [] };
      return acc;
    }, {} as any);
  });

  const [incarcare, setIncarcare] = useState(false);

  // Funcții ajutătoare pentru manipularea rândurilor din tabele
  // 2. ACTUALIZARE: Generăm UUID-ul doar AICI, controlat, la acțiunea utilizatorului
  const adaugaRand = (tip: "cursuri" | "publicatii" | "activitatiRemediale") => {
    const nouId = crypto.randomUUID(); // Generat o singură dată per click executat

    setDatePeAni((prev) => {
      const copieAn = { ...prev[anCurent] };
      
      if (tip === "cursuri") {
        copieAn.cursuri = [...copieAn.cursuri, { id: nouId, denumireCurs: "", nrCredite: "", furnizor: "" }];
      }
      if (tip === "publicatii") {
        copieAn.publicatii = [...copieAn.publicatii, { id: nouId, titlu: "", issnIsbn: "", locPublicare: "" }];
      }
      if (tip === "activitatiRemediale") {
        copieAn.activitatiRemediale = [...copieAn.activitatiRemediale, { id: nouId, materia: "", clasa: "", nrElevi: "", progresElev: "" }];
      }
      
      return { ...prev, [anCurent]: copieAn };
    });
  };

  const stergeRand = (tip: "cursuri" | "publicatii" | "activitatiRemediale", id: string) => {
    setDatePeAni((prev) => {
      const copieAn = { ...prev[anCurent] };
      copieAn[tip] = (copieAn[tip] as any[]).filter((item) => item.id !== id);
      return { ...prev, [anCurent]: copieAn };
    });
  };

  const modificaCamp = (tip: "cursuri" | "publicatii" | "activitatiRemediale", id: string, camp: string, valoare: string) => {
    setDatePeAni((prev) => {
      const copieAn = { ...prev[anCurent] };
      copieAn[tip] = (copieAn[tip] as any[]).map((item) => {
        if (item.id === id) {
          return { ...item, [camp]: valoare };
        }
        return item;
      });
      return { ...prev, [anCurent]: copieAn };
    });
  };

  const handleTrimite = async () => {
    if (!nume.trim() || !prenume.trim()) {
      alert("Vă rugăm să introduceți Numele și Prenumele!");
      return;
    }

    setIncarcare(true);

    // Flattening datele: Transformăm obiectul complex într-o structură simplă, plată pentru Google Sheets
    const payload = {
      nume,
      prenume,
      datePeAni: ANI_SCOLARI.map((an) => ({
        anScolar: an,
        cursuri: datePeAni[an].cursuri.map(({ denumireCurs, nrCredite, furnizor }) => ({ denumireCurs, nrCredite, furnizor })),
        publicatii: datePeAni[an].publicatii.map(({ titlu, issnIsbn, locPublicare }) => ({ titlu, issnIsbn, locPublicare })),
        activitatiRemediale: datePeAni[an].activitatiRemediale.map(({ materia, clasa, nrElevi, progresElev }) => ({ materia, clasa, nrElevi, progresElev })),
      })),
    };

    try {
      const raspuns = await fetch("/api/submit-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (raspuns.ok) {
        alert("Datele au fost trimise cu succes în Google Sheets!");
        setNume("");
        setPrenume("");
        setDatePeAni(ANI_SCOLARI.reduce((acc, an) => {
          acc[an] = { cursuri: [], publicatii: [], activitatiRemediale: [] };
          return acc;
        }, {} as any));
      } else {
        alert("A apărut o eroare la salvare.");
      }
    } catch (err) {
      console.error(err);
      alert("Eroare de conexiune.");
    } finally {
      setIncarcare(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6 text-slate-800">
      {/* SECTION IDENTIFICARE */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <h2 className="text-xl font-bold border-b pb-2">Date Identificare Cadru Didactic</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-600">Nume</label>
            <input
              type="text"
              value={nume}
              onChange={(e) => setNume(e.target.value)}
              placeholder="Popescu"
              className="p-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-sky-500 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-slate-600">Prenume</label>
            <input
              type="text"
              value={prenume}
              onChange={(e) => setPrenume(e.target.value)}
              placeholder="Ion"
              className="p-2 border rounded-lg bg-slate-50 focus:bg-white focus:outline-sky-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* TABS SELECȚIE AN */}
      <div className="space-y-4">
        <div className="flex border-b overflow-x-auto bg-slate-100 p-1 rounded-xl border">
          {ANI_SCOLARI.map((an) => (
            <button
              key={an}
              onClick={() => setAnCurent(an)}
              className={`flex-1 min-w-[100px] text-center py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
                anCurent === an ? "bg-white shadow-sm text-slate-900 border" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Anul {an}
            </button>
          ))}
        </div>
        <div className="bg-sky-50 text-sky-800 border border-sky-200 text-center py-2 rounded-lg font-semibold text-sm">
          Se editează activitățile pentru anul școlar: {anCurent}
        </div>
      </div>

      {/* TABEL 1: CURSURI */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-bold text-sky-600">Cursuri cu credite</h3>
          <button type="button" onClick={() => adaugaRand("cursuri")} className="bg-sky-50 hover:bg-sky-100 text-sky-600 text-xs font-bold py-1.5 px-3 rounded-lg border border-sky-200 transition-all">
            + Adaugă Curs
          </button>
        </div>
        {datePeAni[anCurent].cursuri.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Nu s-a adăugat niciun curs pentru acest an.</p>
        ) : (
          <div className="space-y-3">
            {datePeAni[anCurent].cursuri.map((item, idx) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-2 items-center bg-slate-50 p-3 rounded-xl border">
                <input type="text" value={item.denumireCurs} onChange={(e) => modificaCamp("cursuri", item.id, "denumireCurs", e.target.value)} placeholder="Denumire Curs" className="w-full md:flex-[5] p-2 border rounded-lg bg-white" />
                <input type="number" value={item.nrCredite} onChange={(e) => modificaCamp("cursuri", item.id, "nrCredite", e.target.value)} placeholder="Credite" className="w-full md:flex-[2] p-2 border rounded-lg bg-white" />
                <input type="text" value={item.furnizor} onChange={(e) => modificaCamp("cursuri", item.id, "furnizor", e.target.value)} placeholder="Furnizor" className="w-full md:flex-[4] p-2 border rounded-lg bg-white" />
                <button type="button" onClick={() => stergeRand("cursuri", item.id)} className="text-red-500 font-semibold text-sm px-2 py-1 hover:bg-red-50 rounded-lg">Șterge</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TABEL 2: PUBLICAȚII */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-bold text-emerald-600">Publicații</h3>
          <button type="button" onClick={() => adaugaRand("publicatii")} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold py-1.5 px-3 rounded-lg border border-emerald-200 transition-all">
            + Adaugă Publicație
          </button>
        </div>
        {datePeAni[anCurent].publicatii.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Nu s-a adăugat nicio publicație pentru acest an.</p>
        ) : (
          <div className="space-y-3">
            {datePeAni[anCurent].publicatii.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-2 items-center bg-slate-50 p-3 rounded-xl border">
                <input type="text" value={item.titlu} onChange={(e) => modificaCamp("publicatii", item.id, "titlu", e.target.value)} placeholder="Titlu Publicație" className="w-full md:flex-[5] p-2 border rounded-lg bg-white" />
                <input type="text" value={item.issnIsbn} onChange={(e) => modificaCamp("publicatii", item.id, "issnIsbn", e.target.value)} placeholder="ISSN / ISBN" className="w-full md:flex-[3] p-2 border rounded-lg bg-white" />
                <input type="text" value={item.locPublicare} onChange={(e) => modificaCamp("publicatii", item.id, "locPublicare", e.target.value)} placeholder="Loc Publicare / Pag." className="w-full md:flex-[3] p-2 border rounded-lg bg-white" />
                <button type="button" onClick={() => stergeRand("publicatii", item.id)} className="text-red-500 font-semibold text-sm px-2 py-1 hover:bg-red-50 rounded-lg">Șterge</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TABEL 3: REMEDIALĂ */}
      <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-bold text-amber-600">Registru activități de învățare remedială</h3>
          <button type="button" onClick={() => adaugaRand("activitatiRemediale")} className="bg-amber-50 hover:bg-amber-100 text-amber-600 text-xs font-bold py-1.5 px-3 rounded-lg border border-amber-200 transition-all">
            + Adaugă Activitate
          </button>
        </div>
        {datePeAni[anCurent].activitatiRemediale.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Nu s-au înregistrat activități remediale pentru acest an.</p>
        ) : (
          <div className="space-y-3">
            {datePeAni[anCurent].activitatiRemediale.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-2 items-center bg-slate-50 p-3 rounded-xl border">
                <input type="text" value={item.materia} onChange={(e) => modificaCamp("activitatiRemediale", item.id, "materia", e.target.value)} placeholder="Materia" className="w-full md:flex-[3] p-2 border rounded-lg bg-white" />
                <input type="text" value={item.clasa} onChange={(e) => modificaCamp("activitatiRemediale", item.id, "clasa", e.target.value)} placeholder="Clasa" className="w-full md:flex-[2] p-2 border rounded-lg bg-white" />
                <input type="number" value={item.nrElevi} onChange={(e) => modificaCamp("activitatiRemediale", item.id, "nrElevi", e.target.value)} placeholder="Nr. Elevi" className="w-full md:flex-[2] p-2 border rounded-lg bg-white" />
                <input type="text" value={item.progresElev} onChange={(e) => modificaCamp("activitatiRemediale", item.id, "progresElev", e.target.value)} placeholder="Progres Elev" className="w-full md:flex-[4] p-2 border rounded-lg bg-white" />
                <button type="button" onClick={() => stergeRand("activitatiRemediale", item.id)} className="text-red-500 font-semibold text-sm px-2 py-1 hover:bg-red-50 rounded-lg">Șterge</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BUTON SUBMIT */}
      <div className="flex justify-end pt-4">
        <button
          type="button"
          disabled={incarcare}
          onClick={handleTrimite}
          className="w-full md:w-auto px-12 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:bg-slate-400 transition-all shadow-md"
        >
          {incarcare ? "Se trimit datele..." : "Trimite Toate Datele"}
        </button>
      </div>
    </div>
  );
}