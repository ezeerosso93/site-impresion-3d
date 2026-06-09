import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

const isMockMode = supabaseUrl.includes('placeholder.supabase.co');

export default function QuoteRequestForm() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [material, setMaterial] = useState('PLA Rojo');
  const [mensaje, setMensaje] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (ext !== 'stl' && ext !== '3mf' && ext !== 'obj') {
        setErrorMsg('Solo se permiten archivos en formato .STL, .3MF o .OBJ');
        setFile(null);
        return;
      }
      
      setErrorMsg('');
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !file) {
      setErrorMsg('Nombre, Correo y el Archivo 3D son requeridos.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      let archivoUrl = '';

      if (isMockMode) {
        // Mock upload delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
        archivoUrl = `https://mock-storage.supabase.co/archivos-3d/pedidos/${Date.now()}-${file.name}`;
      } else {
        // 1. Upload to Supabase Storage Bucket 'archivos-3d'
        const fileExt = file.name.split('.').pop();
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const finalPath = `pedidos/${Math.random().toString(36).substring(2, 7)}-${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('archivos-3d')
          .upload(finalPath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadErr) {
          throw new Error(`Error al subir archivo a Storage: ${uploadErr.message}`);
        }

        // 2. Get Public URL
        const { data: urlData } = supabase.storage
          .from('archivos-3d')
          .getPublicUrl(finalPath);
          
        archivoUrl = urlData.publicUrl;
      }

      // 3. Create print order in database
      const orderId = isMockMode
        ? `ORD-${Math.floor(1000 + Math.random() * 9000)}`
        : crypto.randomUUID();
      
      if (isMockMode) {
        // Save to localstorage for mock synchronization
        const savedOrdersStr = localStorage.getItem('mock_orders_3d') || '[]';
        const savedOrders = JSON.parse(savedOrdersStr);
        const newOrder = {
          id: orderId,
          cliente_nombre: nombre,
          archivo_url: archivoUrl,
          material: material,
          estado: 'pendiente',
          precio_final: null,
          created_at: new Date().toISOString(),
          tel_cliente: telefono,
          email_cliente: email,
          notas_internas: mensaje
        };
        localStorage.setItem('mock_orders_3d', JSON.stringify([newOrder, ...savedOrders]));
      } else {
        // Fetch material ID to populate the foreign key
        const { data: matData } = await supabase
          .from('materiales_3d')
          .select('id')
          .eq('nombre', material)
          .maybeSingle();

        const { error: dbErr } = await supabase
          .from('ordenes_impresion')
          .insert({
            id: orderId,
            cliente_nombre: nombre,
            archivo_url: archivoUrl,
            material_id: matData?.id || null,
            estado: 'pendiente',
            cliente_telefono: telefono,
            cliente_email: email,
            notas_internas: mensaje
          });

        if (dbErr) {
          throw new Error(`Error al guardar orden en DB: ${dbErr.message}`);
        }
      }

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error inesperado al subir la orden.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-[#0e1712] p-8 text-center max-w-xl mx-auto shadow-xl">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" />
        <h2 className="mt-4 font-outfit text-2xl font-bold text-white">¡Cotización Solicitada con Éxito!</h2>
        <p className="mt-3 text-sm text-slate-300 leading-relaxed">
          Subimos tu archivo correctamente. El administrador analizará las horas de impresión y los gramos estimados de material. Recibirás tu cotización en un plazo máximo de 3 días hábiles en tu correo electrónico.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setNombre('');
            setEmail('');
            setTelefono('');
            setMensaje('');
            setFile(null);
          }}
          className="mt-6 inline-flex justify-center rounded-lg bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition-colors"
        >
          Enviar Otra Pieza
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl rounded-2xl border border-white/5 bg-[#0e1017] p-8 shadow-2xl relative">
      <h2 className="font-outfit text-xl font-bold text-white mb-6">Detalles de la Pieza a Imprimir</h2>

      {errorMsg && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 flex gap-3 text-xs text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Nombre completo *</label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Pedro Pérez"
              disabled={loading}
              className="w-full h-10 rounded-lg border border-white/10 bg-[#07080b] px-3 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Teléfono contacto *</label>
            <input
              type="tel"
              required
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 1155998877"
              disabled={loading}
              className="w-full h-10 rounded-lg border border-white/10 bg-[#07080b] px-3 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Correo Electrónico *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="pedro.perez@gmail.com"
            disabled={loading}
            className="w-full h-10 rounded-lg border border-white/10 bg-[#07080b] px-3 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Material Preferido</label>
          <select
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            disabled={loading}
            className="w-full h-10 rounded-lg border border-white/10 bg-[#07080b] px-3 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
          >
            <option value="PLA Rojo">PLA (Recomendado para figuras y prototipos)</option>
            <option value="PETG Negro">PETG (Mayor resistencia al agua e impactos)</option>
            <option value="ABS Gris">ABS (Resiste calor y altas fuerzas mecánicas)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Notas o especificaciones</label>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Especificá color, porcentaje de relleno (infill), densidad de paredes, escala, o si requiere algún acabado especial..."
            rows={3}
            disabled={loading}
            className="w-full rounded-lg border border-white/10 bg-[#07080b] px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
        </div>

        {/* File Drag and Drop */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-400 mb-2">Subir archivo 3D (.STL, .3MF, .OBJ) *</label>
          <div className="relative flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#07080b] p-6 text-center hover:border-blue-500/40 transition-colors">
            <input
              type="file"
              id="file-3d"
              required
              accept=".stl,.3mf,.obj"
              onChange={handleFileChange}
              disabled={loading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <Upload className="h-8 w-8 text-slate-500 mb-2 group-hover:text-blue-400" />
            {file ? (
              <div className="flex items-center gap-1 text-sm font-semibold text-blue-400">
                <FileText className="h-4 w-4" />
                <span>{file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
              </div>
            ) : (
              <div>
                <p className="text-xs font-medium text-slate-300">Arrastrá tu archivo o hacé click aquí</p>
                <p className="mt-1 text-[10px] text-slate-500">Máximo 50MB. Formatos .stl, .3mf, .obj</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-8 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando y Subiendo Pieza...
          </>
        ) : (
          'Enviar Solicitud de Cotización'
        )}
      </button>
    </form>
  );
}
