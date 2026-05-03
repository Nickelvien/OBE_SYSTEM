import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { fontSize: 20, textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
  subHeader: { fontSize: 14, marginBottom: 10 },
  table: { display: 'flex', flexDirection: 'column', borderWidth: 1, borderColor: '#000', marginBottom: 20 },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#000' },
  headerCell: { flex: 1, padding: 5, fontWeight: 'bold', fontSize: 10, backgroundColor: '#f3f4f6' },
  cell: { flex: 1, padding: 5, fontSize: 10 },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ChedComplianceReport = ({ programName, periodName, plos }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>OBE Compliance Report (CHED)</Text>
      <Text style={styles.subHeader}>Program: {programName}</Text>
      <Text style={styles.subHeader}>Academic Period: {periodName}</Text>
      
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={styles.headerCell}>PLO Code</Text>
          <Text style={styles.headerCell}>Description</Text>
          <Text style={styles.headerCell}>Attainment %</Text>
          <Text style={styles.headerCell}>Status</Text>
        </View>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {plos.map((plo: any, i: number) => (
          <View style={styles.row} key={i}>
            <Text style={styles.cell}>{plo.code}</Text>
            <Text style={styles.cell}>{plo.description}</Text>
            <Text style={styles.cell}>{plo.attainment}%</Text>
            <Text style={styles.cell}>{plo.attainment >= 75 ? 'Met' : 'Requires CQI'}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);
