# دليل ربط قاعدة البيانات السحابية (Supabase) خلال 5 دقائق

يعمل المشروع مباشرة في VS Code للتجربة المحلية دون أي إعداد. وعند تجهيزه لعميل حقيقي لكي يعدّل الأسعار والحسابات البنكية من جواله ويرفع الزبائن صور سندات الإيداع:

## 1. إنشاء مشروع مجاني على Supabase
1. افتح [supabase.com](https://supabase.com) وأنشئ مشروعاً جديداً مجانياً.
2. من **SQL Editor** الصق الكود التالي وشغّله مرة واحدة:

```sql
create table if not exists menu_items (
  id bigint primary key,
  name text not null,
  category text not null,
  price numeric not null,
  badge text default '',
  has_sizes boolean default true,
  available boolean default true,
  addons jsonb default '[]'::jsonb,
  description text default '',
  image_url text default ''
);

create table if not exists bank_accounts (
  id bigint primary key,
  bank_name text not null,
  account_number text not null,
  account_holder text default ''
);

alter table menu_items enable row level security;
alter table bank_accounts enable row level security;

create policy "Public read menu" on menu_items for select using (true);
create policy "Public write menu" on menu_items for all using (true) with check (true);
create policy "Public read banks" on bank_accounts for select using (true);
create policy "Public write banks" on bank_accounts for all using (true) with check (true);
```

## 2. إنشاء مجلد حفظ سندات الإيداع (Storage)
1. من قائمة **Storage** في Supabase أنشئ Bucket باسم `receipts` واجعله **Public**.
2. أضف Policy تسمح بـ `INSERT` و `SELECT` للعامة على `receipts`.

## 3. ربط المفاتيح في `js/config.js`
انسخ `Project URL` و `anon public key` من **Project Settings > API** وضعهما في `js/config.js`:
```js
supabaseUrl: "https://YOUR_PROJECT.supabase.co",
supabaseAnonKey: "YOUR_ANON_KEY",
```

## الدخول السري للوحة الإدارة
* اضغط على **شعار أو اسم المحل 3 نقرات متتالية** في الصفحة الرئيسية، أو افتح `admin.html` مباشرة.
