import path from "path";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { formatPrice, formatThaiDate } from "@/lib/format";
import { calcRentalTotal, unitLabels, type DurationUnit } from "@/lib/quote-cart";

// Register IBM Plex Sans Thai so Thai glyphs render (default Helvetica has none).
// Resolve from public/fonts via an absolute path so it works under the Node
// runtime in dev and in a production build.
const fontsDir = path.join(process.cwd(), "public", "fonts");
Font.register({
  family: "IBMPlexSansThai",
  fonts: [
    { src: path.join(fontsDir, "IBMPlexSansThai-Regular.ttf") },
    { src: path.join(fontsDir, "IBMPlexSansThai-Bold.ttf"), fontWeight: "bold" },
  ],
});
// Thai has no spaces between words; disable hyphenation so words don't break.
Font.registerHyphenationCallback((word) => [word]);

export interface QuotationPdfItem {
  name: string;
  nameTh?: string | null;
  quantity: number;
  durationAmount: number;
  durationUnit: DurationUnit;
  rentPriceMonthly: number;
  depositAmount: number;
}

export interface QuotationPdfProps {
  quoteNumber: string;
  createdAt: Date;
  validUntil: Date;
  provider: {
    companyName: string;
    taxId?: string | null;
    address?: string | null;
    province?: string | null;
  };
  contact: {
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    organization?: string | null;
    billingAddress: string;
  };
  items: QuotationPdfItem[];
  rentalTotal: number;
  depositTotal: number;
  total: number;
  notes?: string | null;
}

const styles = StyleSheet.create({
  page: {
    fontFamily: "IBMPlexSansThai",
    fontSize: 10,
    color: "#1a1a1a",
    paddingTop: 36,
    paddingBottom: 48,
    paddingHorizontal: 40,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  brand: { fontSize: 20, fontWeight: "bold", color: "#1AA0C4" },
  docTitle: { fontSize: 16, fontWeight: "bold" },
  muted: { color: "#666" },
  metaRight: { textAlign: "right" },
  section: { marginBottom: 16 },
  twoCol: { flexDirection: "row", justifyContent: "space-between", gap: 24 },
  col: { flex: 1 },
  label: { fontSize: 8, color: "#888", marginBottom: 2, textTransform: "uppercase" },
  bold: { fontWeight: "bold" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    paddingVertical: 6,
    paddingHorizontal: 6,
    fontWeight: "bold",
    fontSize: 9,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  cName: { flex: 4 },
  cQty: { flex: 1, textAlign: "center" },
  cDur: { flex: 1.4, textAlign: "center" },
  cUnit: { flex: 1.6, textAlign: "right" },
  cSub: { flex: 1.8, textAlign: "right" },
  totals: { marginTop: 12, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", width: 220, paddingVertical: 2 },
  grandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220,
    paddingVertical: 6,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#333",
    fontWeight: "bold",
    fontSize: 12,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#999",
    textAlign: "center",
  },
});

export function QuotationPdf(props: QuotationPdfProps) {
  const { provider, contact, items } = props;
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>Spark Go</Text>
            <Text style={[styles.muted, { marginTop: 2 }]}>
              แพลตฟอร์มเช่าอุปกรณ์ทำโปรเจกต์
            </Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.docTitle}>ใบเสนอราคา</Text>
            <Text style={styles.muted}>เลขที่ {props.quoteNumber}</Text>
            <Text style={styles.muted}>
              วันที่ {formatThaiDate(props.createdAt, "d MMM yyyy", "BE")}
            </Text>
            <Text style={styles.muted}>
              ยืนราคาถึง {formatThaiDate(props.validUntil, "d MMM yyyy", "BE")}
            </Text>
          </View>
        </View>

        {/* Parties */}
        <View style={[styles.section, styles.twoCol]}>
          <View style={styles.col}>
            <Text style={styles.label}>ผู้ให้บริการ</Text>
            <Text style={styles.bold}>{provider.companyName}</Text>
            {provider.taxId ? <Text>เลขผู้เสียภาษี {provider.taxId}</Text> : null}
            {provider.address ? <Text>{provider.address}</Text> : null}
            {provider.province ? <Text>{provider.province}</Text> : null}
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>ผู้ขอใบเสนอราคา</Text>
            <Text style={styles.bold}>{contact.contactName}</Text>
            {contact.organization ? <Text>{contact.organization}</Text> : null}
            <Text>{contact.billingAddress}</Text>
            <Text>
              {contact.contactPhone} · {contact.contactEmail}
            </Text>
          </View>
        </View>

        {/* Items table */}
        <View style={styles.tableHeader}>
          <Text style={styles.cName}>รายการ</Text>
          <Text style={styles.cQty}>จำนวน</Text>
          <Text style={styles.cDur}>ระยะเวลา</Text>
          <Text style={styles.cUnit}>ราคา/เดือน</Text>
          <Text style={styles.cSub}>รวม</Text>
        </View>
        {items.map((item, i) => (
          <View style={styles.tableRow} key={i}>
            <Text style={styles.cName}>{item.nameTh || item.name}</Text>
            <Text style={styles.cQty}>{item.quantity}</Text>
            <Text style={styles.cDur}>
              {item.durationAmount} {unitLabels[item.durationUnit]}
            </Text>
            <Text style={styles.cUnit}>{formatPrice(item.rentPriceMonthly)}</Text>
            <Text style={styles.cSub}>{formatPrice(calcRentalTotal(item))}</Text>
          </View>
        ))}

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.muted}>ค่าเช่าตามระยะเวลา</Text>
            <Text>{formatPrice(props.rentalTotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.muted}>มัดจำรวม (คืนเมื่อสิ้นสุดสัญญา)</Text>
            <Text>{formatPrice(props.depositTotal)}</Text>
          </View>
          <View style={styles.grandRow}>
            <Text>ยอดรวมประมาณการ</Text>
            <Text>{formatPrice(props.total)}</Text>
          </View>
        </View>

        {props.notes ? (
          <View style={[styles.section, { marginTop: 16 }]}>
            <Text style={styles.label}>หมายเหตุ</Text>
            <Text>{props.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.footer}>
          ใบเสนอราคานี้เป็นการประมาณการเบื้องต้น ราคายังไม่รวมภาษีมูลค่าเพิ่ม
          และอาจเปลี่ยนแปลงได้ตามเงื่อนไขของผู้ให้บริการ · ออกโดย Spark Go
        </Text>
      </Page>
    </Document>
  );
}
