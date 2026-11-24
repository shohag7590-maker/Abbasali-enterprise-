import { useEffect, useMemo, useState } from 'react';
import { Bell, Building2, Calculator, CheckCircle2, Plus, Send, Trash2, UserRound } from 'lucide-react';

const defaultSettings = {
  company: 'আব্বাস আলী এন্টারপ্রাইজ',
  building: 'হাসনা হেনা ভিলা',
  phone1: '01914219868',
  phone2: '01728822448',
};

const emptyTenant = {
  name: '', mobile: '', currentAddress: '', permanentAddress: '', nid: '', familyMobile: '',
  month: 'January', year: '2006', advance: 0, previousDue: 0, rent: 0,
  meter: '', previousUnit: 0, currentUnit: 0, electricityDue: 0, electricityAdvance: 0,
  gas: 0, service: 0, waste: 0, paid: 0,
};

const number = (value) => Math.max(0, Number(value) || 0);
const totalFor = (t) => number(t.rent) + number(t.previousDue) + number(t.gas) + number(t.service) + number(t.waste)
  + number(t.electricityDue) + number(t.usedUnitElectricity);

export default function App() {
  const [settings, setSettings] = useState(() => JSON.parse(localStorage.getItem('ae-settings') || 'null') || defaultSettings);
  const [tenants, setTenants] = useState(() => JSON.parse(localStorage.getItem('ae-tenants') || 'null') || []);
  const [form, setForm] = useState(emptyTenant);
  const [messageTemplate, setMessageTemplate] = useState('প্রিয় {name}, ভাই আপনার {month} মাসের বাড়িভাড়া {due} টাকা বকেয়া রয়েছে। অনুগ্রহ করে দ্রুত পরিশোধ করুন। ধন্যবাদ। আব্বাস আলী এন্টারপ্রাইজ, হাসনা হেনা ভিলা।');
  const [activeTenant, setActiveTenant] = useState(null);

  useEffect(() => localStorage.setItem('ae-settings', JSON.stringify(settings)), [settings]);
  useEffect(() => localStorage.setItem('ae-tenants', JSON.stringify(tenants)), [tenants]);

  const usedUnits = number(form.currentUnit) - number(form.previousUnit);
  const electricBill = usedUnits * number(form.electricityAdvance); // advance field used as per-unit rate
  const subtotal = number(form.rent) + number(form.previousDue) + number(form.gas) + number(form.service) + number(form.waste) + number(form.electricityDue) + electricBill;
  const balance = subtotal - number(form.advance) - number(form.paid);

  const set = (key, value) => setForm((old) => ({ ...old, [key]: value }));

  const saveTenant = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const record = { ...form, usedUnits, electricBill, subtotal, balance, id: crypto.randomUUID() };
    setTenants((old) => [record, ...old]);
    setForm(emptyTenant);
  };

  const removeTenant = (id) => setTenants((old) => old.filter((item) => item.id !== id));

  const makeMessage = (tenant, type = 'due') => {
    if (type === 'paid') return `প্রিয় ${tenant.name}, আপনার ${tenant.month} মাসের বাড়িভাড়া ${number(tenant.paid)} টাকা পরিশোধ গ্রহণ করা হয়েছে। ধন্যবাদ। ${settings.company}।`;
    return messageTemplate
      .replaceAll('{name}', tenant.name)
      .replaceAll('{month}', tenant.month)
      .replaceAll('{due}', number(tenant.balance));
  };

  const sendWhatsApp = (tenant, type) => {
    const text = encodeURIComponent(makeMessage(tenant, type));
    window.open(`https://wa.me/88${tenant.mobile.replace(/[^0]/g, '').replace(/^0+/, '')}?text=${text}`, '_blank');
  };

  const selected = useMemo(() => tenants.find((item) => item.id === activeTenant), [tenants, activeTenant]);

  return (
    <main>
      <header className="topbar">
        <div className="brand"><div className="brand-icon"><Building2 /></div><div><strong>{settings.company}</strong><span>{settings.building}</span></div></div>
        <div className="phones"><span>০১৯১৪২১৯৮৬৮</span><span>০১৭২৮৮২২৪৪৮</span></div>
      </header>

      <div className="shell">
        <section className="form-card">
          <div className="section-title"><div><UserRound /><b>ভাড়াটিয়ার তথ্য</b></div><span>নতুন হিসাব</span></div>
          <form onSubmit={saveTenant}>
            <div className="grid-3">
              <label>ভাড়াটিয়ার নাম<input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="নাম" required /></label>
              <label>মোবাইল নাম্বার<input value={form.mobile} onChange={(e) => set('mobile', e.target.value)} placeholder="01XXXXXXXXX" /></label>
              <label>মাস<select value={form.month} onChange={(e) => set('month', e.target.value)}>{['January','February','March','April','May','June','July','August','September','October','November','December'].map((m) => <option key={m}>{m}</option>)}</select></label>
              <label>বর্তমান ঠিকানা<input value={form.currentAddress} onChange={(e) => set('currentAddress', e.target.value)} /></label>
              <label>স্থায়ী ঠিকানা<input value={form.permanentAddress} onChange={(e) => set('permanentAddress', e.target.value)} /></label>
              <label>এনআইডি নাম্বার<input value={form.nid} onChange={(e) => set('nid', e.target.value)} /></label>
              <label>ফ্যামিলি মোবাইল<input value={form.familyMobile} onChange={(e) => set('familyMobile', e.target.value)} /></label>
              <label>অ্যাডভান্স / অগ্রিম<input type="number" value={form.advance} onChange={(e) => set('advance', e.target.value)} /></label>
              <label>পূর্বের বকেয়া<input type="number" value={form.previousDue} onChange={(e) => set('previousDue', e.target.value)} /></label>
            </div>

            <div className="section-title compact"><div><Calculator /><b>মাসিক হিসাব</b></div></div>
            <div className="grid-4">
              <label>মাসের ভাড়া (টাকা)<input type="number" value={form.rent} onChange={(e) => set('rent', e.target.value)} /></label>
              <label>মিটার নাম্বার<input value={form.meter} onChange={(e) => set('meter', e.target.value)} /></label>
              <label>পূর্বের ইউনিট<input type="number" value={form.previousUnit} onChange={(e) => set('previousUnit', e.target.value)} /></label>
              <label>বর্তমান ইউনিট<input type="number" value={form.currentUnit} onChange={(e) => set('currentUnit', e.target.value)} /></label>
              <label>ইউনিট প্রতি বিদ্যুৎ বিল<input type="number" value={form.electricityAdvance} onChange={(e) => set('electricityAdvance', e.target.value)} /></label>
              <label>বিদ্যুৎ বিল বকেয়া<input type="number" value={form.electricityDue} onChange={(e) => set('electricityDue', e.target.value)} /></label>
              <label>গ্যাস বিল<input type="number" value={form.gas} onChange={(e) => set('gas', e.target.value)} /></label>
              <label>সার্ভিস চার্জ<input type="number" value={form.service} onChange={(e) => set('service', e.target.value)} /></label>
              <label>ময়লা বিল<input type="number" value={form.waste} onChange={(e) => set('waste', e.target.value)} /></label>
              <label>এই মাসে পরিশোধ<input type="number" value={form.paid} onChange={(e) => set('paid', e.target.value)} /></label>
            </div>

            <div className="summary">
              <div><span>ব্যবহৃত ইউনিট</span><b>{usedUnits}</b></div>
              <div><span>বিদ্যুৎ বিল</span><b>৳ {electricBill}</b></div>
              <div><span>মোট বিল</span><b>৳ {subtotal}</b></div>
              <div className="balance"><span>বকেয়া</span><b>৳ {balance}</b></div>
            </div>

            <button className="primary" type="submit"><Plus size={18}/> হিসাব সেভ করুন</button>
          </form>
        </section>

        <aside>
          <section className="side-card"><div className="section-title"><div><Bell /><b>নোটিফিকেশন</b></div></div>
            <textarea value={messageTemplate} onChange={(e) => setMessageTemplate(e.target.value)} rows={7} />
            <p className="hint">ব্যবহার করুন: <code>{'{name}'}</code>, <code>{'{month}'}</code>, <code>{'{due}'}</code></p>
          </section>
          <section className="side-card"><div className="section-title"><div><Building2 /><b>প্রতিষ্ঠান তথ্য</b></div></div>
            {Object.entries(settings).map(([key, value]) => <label key={key}>{key === 'company' ? 'প্রতিষ্ঠানের নাম' : key === 'building' ? 'বিল্ডিংয়ের নাম' : key === 'phone1' ? 'ফোন ১' : 'ফোন ২'}<input value={value} onChange={(e) => setSettings((old) => ({ ...old, [key]: e.target.value }))} /></label>)}
          </section>
        </aside>
      </div>

      <section className="records">
        <div className="section-title"><div><CheckCircle2 /><b>সেভ করা হিসাব</b></div><span>{tenants.length} জন ভাড়াটিয়া</span></div>
        {tenants.length === 0 ? <div className="empty">এখনও কোনো হিসাব নেই</div> : <div className="table-wrap"><table><thead><tr><th>নাম</th><th>মাস</th><th>মোট বিল</th><th>জমা</th><th>বকেয়া</th><th>কার্যক্রম</th></tr></thead><tbody>{tenants.map((tenant) => <tr key={tenant.id}><td><b>{tenant.name}</b><small>{tenant.mobile}</small></td><td>{tenant.month}</td><td>৳ {tenant.subtotal}</td><td>৳ {tenant.paid}</td><td className="due">৳ {tenant.balance}</td><td className="actions"><button onClick={() => sendWhatsApp(tenant, 'due')} title="বকেয়া পাঠান"><Send size={16}/></button><button onClick={() => sendWhatsApp(tenant, 'paid')} title="জমার নিশ্চিতকরণ"><CheckCircle2 size={16}/></button><button className="danger" onClick={() => removeTenant(tenant.id)} title="মুছুন"><Trash2 size={16}/></button></td></tr>)}</tbody></table></div>}
      </section>
    </main>
  );
}
