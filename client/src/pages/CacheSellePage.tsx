import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Edit2, Trash2, Package, DollarSign, TrendingUp, Box } from "lucide-react";
import Dashboard from "./Dashboard";
import { useToast } from "@/hooks/use-toast";

interface SaddleSale {
  id: string;
  date: string;
  taille_xl: number;
  taille_xxl: number;
  prix: number;
  encaissement: string;
  client: string;
}

import { INITIAL_DATA } from "@/lib/initialData";

export default function CacheSellePage() {
  const [data, setData] = useState<SaddleSale[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState<Omit<SaddleSale, "id">>({
    date: new Date().toISOString().split('T')[0],
    taille_xl: 0,
    taille_xxl: 0,
    prix: 0,
    encaissement: "",
    client: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("saddlesData");
    if (saved) {
      const parsed = JSON.parse(saved) as SaddleSale[];
      parsed.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      setData(parsed);
    } else {
      const initial = [...INITIAL_DATA.saddles].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      setData(initial);
      localStorage.setItem("saddlesData", JSON.stringify(initial));
    }
  }, []);

  const saveData = (newData: SaddleSale[]) => {
    const sorted = [...newData].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    setData(sorted);
    localStorage.setItem("saddlesData", JSON.stringify(sorted));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      saveData(data.map(item => item.id === editingId ? { ...formData, id: editingId } : item));
      toast({ title: "Succès", description: "Vente modifiée" });
    } else {
      saveData([{ ...formData, id: crypto.randomUUID() }, ...data]);
      toast({ title: "Succès", description: "Vente ajoutée" });
    }
    setIsOpen(false);
    setEditingId(null);
    setFormData({ date: new Date().toISOString().split('T')[0], taille_xl: 0, taille_xxl: 0, prix: 0, encaissement: "", client: "" });
  };

  const handleEdit = (item: SaddleSale) => {
    setEditingId(item.id);
    setFormData({ ...item });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Supprimer ?")) {
      saveData(data.filter(item => item.id !== id));
      toast({ title: "Supprimé" });
    }
  };

  const getStatistics = () => {
    const slicedData = selectedRowIndex !== null ? data.slice(selectedRowIndex) : data;
    const totalSaddles = slicedData.reduce((acc, curr) => acc + Number(curr.taille_xl) + Number(curr.taille_xxl), 0);

    return {
      totalSales: slicedData.length,
      totalSaddles: totalSaddles,
      totalRevenue: slicedData.reduce((acc, curr) => acc + Number(curr.prix), 0),
      isFiltered: selectedRowIndex !== null
    };
  };

  const stats = getStatistics();

  return (
    <Dashboard contentOnly={true}>
      <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto bg-gradient-to-br from-gray-50 via-white to-gray-100 min-h-screen animate-enter">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg ring-4 ring-white">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-gray-900 uppercase italic">Cache Selle</h1>
              <p className="text-gray-500 font-medium">Gestion des ventes de cache selle.</p>
            </div>
          </div>
          <Dialog open={isOpen} onOpenChange={o => { setIsOpen(o); if(!o) setEditingId(null); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5 active:translate-y-0">
                <Plus className="w-5 h-5 stroke-[3px]" /> Nouvelle vente
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
              <DialogHeader><DialogTitle className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">{editingId ? "Modifier" : "Nouvelle vente"}</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-4">
                <div className="grid gap-2"><Label className="font-bold text-gray-700 uppercase tracking-wider text-xs px-1">Date</Label><Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required className="h-12 rounded-xl border-gray-200 font-medium" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label className="font-bold text-gray-700 uppercase tracking-wider text-xs px-1">Quantité XL</Label><Input type="number" min="0" value={formData.taille_xl} onChange={e => setFormData({...formData, taille_xl: Number(e.target.value)})} required className="h-12 rounded-xl border-gray-200 font-medium" /></div>
                  <div className="grid gap-2"><Label className="font-bold text-gray-700 uppercase tracking-wider text-xs px-1">Quantité XXL</Label><Input type="number" min="0" value={formData.taille_xxl} onChange={e => setFormData({...formData, taille_xxl: Number(e.target.value)})} required className="h-12 rounded-xl border-gray-200 font-medium" /></div>
                </div>
                <div className="grid gap-2"><Label className="font-bold text-gray-700 uppercase tracking-wider text-xs px-1">Prix (TND)</Label><Input type="number" min="0" step="0.001" value={formData.prix} onChange={e => setFormData({...formData, prix: Number(e.target.value)})} required className="h-12 rounded-xl border-gray-200 font-bold text-red-600" /></div>
                <div className="grid gap-2"><Label className="font-bold text-gray-700 uppercase tracking-wider text-xs px-1">Encaissement</Label><Input value={formData.encaissement} onChange={e => setFormData({...formData, encaissement: e.target.value})} required className="h-12 rounded-xl border-gray-200 font-medium" /></div>
                <div className="grid gap-2"><Label className="font-bold text-gray-700 uppercase tracking-wider text-xs px-1">Client</Label><Input value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} required className="h-12 rounded-xl border-gray-200 font-medium" /></div>
                <Button type="submit" className="w-full h-14 bg-gradient-to-r from-red-600 to-red-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg mt-4">{editingId ? "Mettre à jour" : "Enregistrer"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-white/70 backdrop-blur-sm border-gray-200 shadow-sm hover:shadow-xl transition-all rounded-3xl group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-black text-gray-500 uppercase tracking-widest">Total Historique</CardTitle>
              <div className="p-2 bg-gray-100 rounded-xl group-hover:bg-gray-200"><TrendingUp className="w-4 h-4 text-gray-500" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-gray-900 tracking-tighter italic">{data.length}</div>
              <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase">Ventes</p>
            </CardContent>
          </Card>
          <Card className={`bg-white/70 backdrop-blur-sm border-gray-200 shadow-sm hover:shadow-xl transition-all rounded-3xl group ${stats.isFiltered ? "ring-2 ring-red-500 bg-red-50/30" : ""}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-black text-gray-500 uppercase tracking-widest">Articles (Sél.)</CardTitle>
              <div className="p-2 bg-blue-100 rounded-xl group-hover:bg-blue-200"><Box className="w-4 h-4 text-cyan-600" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-gray-900 tracking-tighter italic">{stats.totalSaddles}</div>
              {stats.isFiltered && <p className="text-[10px] font-black text-red-600 mt-2 uppercase">Filtré</p>}
            </CardContent>
          </Card>
          <Card className={`bg-white/70 backdrop-blur-sm border-gray-200 shadow-sm hover:shadow-xl transition-all rounded-3xl group ${stats.isFiltered ? "ring-2 ring-red-500 bg-red-50/30" : ""}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-black text-gray-500 uppercase tracking-widest">Revenu (Sél.)</CardTitle>
              <div className="p-2 bg-green-100 rounded-xl group-hover:bg-green-200"><DollarSign className="w-4 h-4 text-green-600" /></div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-black text-red-600 tracking-tighter italic">{stats.totalRevenue.toFixed(2)} <span className="text-lg uppercase not-italic">TND</span></div>
              {stats.isFiltered && <p className="text-[10px] font-black text-red-600 mt-2 uppercase">Filtré</p>}
            </CardContent>
          </Card>
        </div>

        <Card className="border-gray-200 shadow-2xl bg-white/80 backdrop-blur-md overflow-hidden rounded-[2.5rem]">
          <CardContent className="p-0">
            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50/80 border-b-2 border-gray-100">
                    <TableHead className="font-black text-gray-900 h-16 uppercase tracking-widest text-[10px]">Date</TableHead>
                    <TableHead className="font-black text-gray-900 h-16 uppercase tracking-widest text-[10px]">XL</TableHead>
                    <TableHead className="font-black text-gray-900 h-16 uppercase tracking-widest text-[10px]">XXL</TableHead>
                    <TableHead className="font-black text-gray-900 h-16 uppercase tracking-widest text-[10px]">Prix</TableHead>
                    <TableHead className="font-black text-gray-900 h-16 uppercase tracking-widest text-[10px]">Encaissement</TableHead>
                    <TableHead className="font-black text-gray-900 h-16 uppercase tracking-widest text-[10px]">Client</TableHead>
                    <TableHead className="text-right font-black text-gray-900 h-16 uppercase tracking-widest text-[10px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow 
                      key={item.id}
                      className={`cursor-pointer transition-all duration-200 h-16 border-b border-gray-50 group ${selectedRowIndex === index ? 'bg-red-50/80 text-red-700 font-bold hover:bg-red-100/80' : 'hover:bg-gray-50/50'}`}
                      onClick={() => setSelectedRowIndex(selectedRowIndex === index ? null : index)}
                    >
                      <TableCell className="py-4 font-bold">{new Date(item.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                      <TableCell className="py-4 font-medium">{item.taille_xl}</TableCell>
                      <TableCell className="py-4 font-medium">{item.taille_xxl}</TableCell>
                      <TableCell className="py-4 font-black text-red-600 italic tracking-tighter">{Number(item.prix).toFixed(2)} TND</TableCell>
                      <TableCell className="py-4 font-bold text-gray-600 uppercase text-[10px] tracking-wider bg-gray-100/30 rounded-lg inline-block my-2 px-3">{item.encaissement}</TableCell>
                      <TableCell className="py-4 font-medium text-gray-500">{item.client}</TableCell>
                      <TableCell className="text-right py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="h-10 w-10 rounded-xl text-gray-400 hover:text-gray-900 hover:bg-white shadow-sm transition-all"><Edit2 className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-10 w-10 rounded-xl text-red-400 hover:text-red-700 hover:bg-white shadow-sm transition-all"><Trash2 className="w-4 h-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Dashboard>
  );
}
