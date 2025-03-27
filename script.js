document.getElementById('playButton').addEventListener('click', function() {
    const userNumber = parseInt(document.getElementById('number').value);
    const userChoice = document.getElementById('choice').value;
    
    // Verifica se o número está dentro do intervalo permitido
    if (isNaN(userNumber) || userNumber < 0 || userNumber > 10) {
        alert('Por favor, escolha um número entre 0 e 10.');
        return;
    }

    // Gera um número aleatório para o computador
    const computerNumber = Math.floor(Math.random() * 11);
    const total = userNumber + computerNumber;

    // Determina se o total é par ou ímpar
    const isTotalEven = total % 2 === 0;
    const resultText = isTotalEven ? 'Par' : 'Ímpar';

    // Verifica se o usuário ganhou
    const userWon = (isTotalEven && userChoice === 'par') || (!isTotalEven && userChoice === 'impar');

    // Exibe o resultado
    let resultMessage = `Você escolheu ${userNumber} e o computador escolheu ${computerNumber}. Total: ${total} (${resultText}). `;
    resultMessage += userWon ? 'Você ganhou!' : 'Você perdeu!';
    
    document.getElementById('result').innerText = resultMessage;
});
