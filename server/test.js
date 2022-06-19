daca diferenta_dintre_commituri > prag
    semnalare = 1
altfel
    semnalare = 0

    if (number_of_lines(target_code) > number_of_lines(code)) {
        common_lines_vector.push(common_lines);
        added_lines_vector.push(count_added_lines);
        deleted_lines_vector.push(count_deleted_lines);
        let similarity = (common_lines / number_of_lines(target_code)) * 100;
        similarity_vector.push(parseFloat(similarity.toFixed(2)));
    } else {
        common_lines_vector.push(common_lines);
        added_lines_vector.push(count_added_lines);
        deleted_lines_vector.push(count_deleted_lines);
        let similarity = (common_lines / number_of_lines(code)) * 100;
        similarity_vector.push(parseFloat(similarity.toFixed(2)));
    }

N = numar_linii_comune
daca numar_linii_cod_1 > numar_linii_cod_2
    x = numar_linii_cod_1
    similarity = N * 100 / x
altfel
    x = numar_linii_cod_2
    similarity = N * 100 / x

