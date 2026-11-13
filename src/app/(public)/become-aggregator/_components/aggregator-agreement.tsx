// Text of "Amasezerano y'Ibanze y'Umukusanyi" (Food Bundles preliminary
// aggregator agreement). Keep AGREEMENT_VERSION in step with the backend's
// AGGREGATOR_AGREEMENT_VERSION when the wording changes.
export const AGREEMENT_VERSION = "2026-11-rw-v1";

const WHAT_THEY_DO = [
  "Kwandika abahinzi bo mu gace ke muri porogaramu no kubafasha kuyikoresha.",
  "Kwakira umusaruro, kuwupima neza no kuwutondeka akurikije ubwiza (grading).",
  "Kwishyura abahinzi ku giciro cyatanzwe na Food Bundles, nta kugabanya.",
  "Kubika umusaruro ahantu hasukuye kandi hari igicucu, no kuwupakira mu bikoresho bikwiye.",
  "Gutanga amakuru ku musaruro uri mu gace ke n'uzaboneka mu minsi iri imbere.",
  "Kugira abahinzi inama ku buryo bwiza bwo gusarura no gufata neza umusaruro.",
];

const HOW_IT_WORKS = [
  "Umuhinzi yohereza umusaruro we muri porogaramu ya Farmer Partner, avuga icyo afite n'ingano yacyo.",
  "Iyo Food Bundles imaze kuwemeza, porogaramu iyobora umuhinzi ku mukusanyi umwegereye. Umukusanyi amenyeshwa mbere ibigiye kuza, akitegura.",
  "Umuhinzi azana umusaruro ku cyicaro cy'umukusanyi, upimirwa imbere ye kandi ukagenzurwa ubwiza.",
  "Umukusanyi yishyura umuhinzi ako kanya kuri Mobile Money, akoresheje wallet igenewe kwishyura abahinzi gusa.",
  "Umukusanyi abika umusaruro neza kugeza imodoka ya Food Bundles iwutwaye ku gihe cyagenwe.",
  "Food Bundles imaze kwakira umusaruro, wallet yongera kuzuzwa, komisiyo ikajya kuri konti y'umukusanyi.",
];

const ARTICLES: [string, string][] = [
  ["Abagirana amasezerano", "Food Bundles Limited (TIN 112265383) n'umuntu wiyandikisha, witwa “Umukusanyi” muri aya masezerano."],
  ["Imiterere y'ubufatanye", "Umukusanyi akora nk'umuntu wigenga. Aya si amasezerano y'akazi, kandi nta mushahara uteganyijwe."],
  ["Komisiyo", "Umukusanyi ahabwa ijanisha (%) ry'agaciro k'umusaruro yakusanyije, wakiriwe na Food Bundles kandi umuhinzi akaba yarishyuwe. Komisiyo itangirira kuri 4% ikagera kuri 7%, bitewe n'ubwiza bw'umusaruro, ingano yawo n'ubunyangamugayo."],
  ["Igishoro cyo kwishyura abahinzi", "Amafaranga ari muri wallet y'umukusanyi akoreshwa gusa mu kwishyura abahinzi ku giciro cya Food Bundles. Komisiyo yonyine ni yo ishobora kubikuzwa."],
  ["Inshingano z'Umukusanyi", "Gupima neza, kwishyura umuhinzi ku gihe kandi ku giciro cyagenwe, no kubika umusaruro neza. Agomba kandi kubaha abahinzi, kandi ntabake amafaranga y'inyongera cyangwa ruswa."],
  ["Inshingano za Food Bundles", "Gutanga ibiciro bisobanutse no gutwara umusaruro ku gihe. Itanga kandi amahugurwa, ibikoresho by'ikoranabuhanga n'ubufasha buhoraho."],
  ["Kuvugana, amahugurwa no kwinjizwa", "Iyo utanze imeyili na telefoni yawe, wemera ko Food Bundles ikuvugisha. Izakusobanurira icyo ubu bufatanye bukumariye, ikuhe amahugurwa, kandi igufashe kwinjira mu buryo bwose."],
  ["Ikirango n'izindi nshingano", "Mu gihe ukusanya umusaruro, ukoresha ikirango cya Food Bundles gusa. Ntuvanga ibikorwa by'umusaruro n'imirimo cyangwa ikirango cy'ikindi kigo ukorera, harimo na serivisi za Leta."],
  ["Amakuru bwite", "Amakuru yawe akoreshwa muri ubu bufatanye gusa, hubahirizwa itegeko rirengera amakuru bwite. Ntagurishwa, kandi ushobora gusaba ko asibwa."],
  ["Guhagarika ubufatanye", "Buri ruhande rushobora guhagarika ubufatanye igihe icyo ari cyo cyose. Food Bundles ihagarika ako kanya umukusanyi ukoze uburiganya cyangwa ubangamira abahinzi."],
  ["Amasezerano yuzuye", "Aya ni amasezerano y'ibanze. Amasezerano yuzuye azasinywa nyuma y'amahugurwa no kwinjizwa."],
];

export const AGREEMENT_CONSENT =
  "Nasomye kandi nemeye ingingo z'aya masezerano y'ibanze. Nemeye kandi ko Food Bundles imvugisha ku bijyanye n'ubufatanye, amahugurwa no kwinjizwa.";

const H = ({ children }: { children: React.ReactNode }) => (
  <h3 className="m-0 mb-2 mt-6 text-[17px] font-bold text-[#007A35] first:mt-0">{children}</h3>
);

export function AggregatorAgreement() {
  return (
    <div className="text-[15px] leading-[1.7] text-[#2E4A3B]">
      <H>Umukusanyi ni nde?</H>
      <p className="m-0 text-[15px] leading-[1.7]">
        Umukusanyi ni umuntu wigenga utuye hafi y&apos;abahinzi n&apos;aborozi. Akira umusaruro wabo mu izina rya Food Bundles:
        arawupima, akagenzura ubwiza bwawo, akishyura umuhinzi, hanyuma akawushyikiriza imodoka ya Food Bundles. Si umukozi
        uhembwa umushahara, ahubwo ni rwiyemezamirimo uhabwa komisiyo ya 4% kugeza kuri 7% ku musaruro yakusanyije kandi wishyuwe.
      </p>

      <H>Icyo akora</H>
      <ul className="m-0 flex list-disc flex-col gap-1 pl-5">
        {WHAT_THEY_DO.map((t) => <li key={t}>{t}</li>)}
      </ul>

      <H>Uko akora</H>
      <ol className="m-0 flex list-decimal flex-col gap-1 pl-5">
        {HOW_IT_WORKS.map((t) => <li key={t}>{t}</li>)}
      </ol>

      <H>Uruhare mu kugabanya ibihombo nyuma y&apos;isarura</H>
      <p className="m-0 text-[15px] leading-[1.7]">
        Kubera ko umuhinzi asarura azi ko afite umuguzi umwegereye, umusaruro ntutinda mu murima. Imodoka zifata umusaruro wose ku
        cyicaro kimwe, mu gihe gito, ukiri mushya. Umusaruro wangiritse ukurwamo hakiri kare, kandi uwusigaye ugafatwa neza.
        Umusaruro utangirika ni amafaranga menshi mu mufuka w&apos;umuhinzi n&apos;uw&apos;umukusanyi.
      </p>

      <h3 className="m-0 mb-2 mt-8 border-t border-[#DCE6DF] pt-6 text-[19px] font-bold text-[#0B2E1F]">
        Amasezerano y&apos;Ibanze yo Kwiyandikisha nk&apos;Umukusanyi
      </h3>
      <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
        {ARTICLES.map(([title, text], i) => (
          <li key={title} className="grid grid-cols-[1.75rem_1fr]">
            <span className="font-bold text-[#007A35]">{i + 1}.</span>
            <span>
              <b className="text-[#0B2E1F]">{title}:</b> {text}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
