import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica' },
  header: { fontSize: 20, textAlign: 'center', marginBottom: 20, fontWeight: 'bold' },
  row: { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 5 },
  cell: { flex: 1, fontSize: 12 },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TesdaCompetencyReport = ({ programName, students }: any) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>TESDA Competency Assessment Matrix</Text>
      <Text style={{ fontSize: 14, marginBottom: 20 }}>Qualification: {programName}</Text>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {students.map((s: any, i: number) => (
        <View style={styles.row} key={i}>
          <Text style={styles.cell}>{s.name}</Text>
          <Text style={styles.cell}>{s.result === 'competent' ? 'Competent' : 'Not Yet Competent'}</Text>
        </View>
      ))}
    </Page>
  </Document>
);
